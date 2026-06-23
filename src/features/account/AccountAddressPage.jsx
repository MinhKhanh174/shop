import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AccountLayout from './AccountLayout'
import './account.css'
import { ROUTES } from '../../config/routes'
import { getAuthUser } from '../../utils/authStorage'
import { loadAddresses, saveAddresses } from '../../utils/addressStorage'
import { getDistrictsByProvinceCode, getProvinces, getWardsByDistrictCode } from '../../services/addressApi'

const COUNTRY_OPTIONS = [{ code: 'VN', name: 'Vietnam' }]
const EMPTY_FORM_VALUES = {
  countryCode: 'VN',
  countryName: 'Vietnam',
  provinceCode: '',
  provinceName: '',
  districtCode: '',
  districtName: '',
  wardCode: '',
  wardName: '',
  fullName: '',
  phone: '',
  company: '',
  address: '',
  zip: '',
  defaultAddress: false,
}

function stripVietnameseAccents(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function filterOptions(options, searchValue) {
  const query = stripVietnameseAccents(searchValue)

  if (!query) {
    return options
  }

  return options.filter((option) => {
    return (
      stripVietnameseAccents(option.name).includes(query) ||
      stripVietnameseAccents(option.code).includes(query)
    )
  })
}

function stripProvincePrefix(value) {
  return String(value ?? '')
    .replace(/^(Tỉnh|Thành phố|Thành Phố|TP\.?|TP)\s+/i, '')
    .trim()
}

function buildAddressSummary(address) {
  return [address.address, address.wardName, address.districtName, address.provinceName, address.countryName]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .join(', ')
}

function normalizeDefaultAddresses(addresses) {
  if (!addresses.length) {
    return addresses
  }

  const defaultIndex = addresses.findIndex((address) => address.defaultAddress)

  if (defaultIndex >= 0) {
    return addresses.map((address, index) => ({
      ...address,
      defaultAddress: index === defaultIndex,
    }))
  }

  return addresses.map((address, index) => ({
    ...address,
    defaultAddress: index === 0,
  }))
}

function createFormValuesFromAddress(address) {
  return {
    countryCode: address?.countryCode ?? 'VN',
    countryName: address?.countryName ?? 'Vietnam',
    provinceCode: address?.provinceCode ?? '',
    provinceName: address?.provinceName ?? '',
    districtCode: address?.districtCode ?? '',
    districtName: address?.districtName ?? '',
    wardCode: address?.wardCode ?? '',
    wardName: address?.wardName ?? '',
    fullName: address?.fullName ?? '',
    phone: address?.phone ?? '',
    company: address?.company ?? '',
    address: address?.address ?? '',
    zip: address?.zip ?? '',
    defaultAddress: Boolean(address?.defaultAddress),
  }
}

let addressIdCounter = 0

function createAddressId(existingId = null) {
  if (existingId) {
    return existingId
  }

  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `address-${crypto.randomUUID()}`
  }

  addressIdCounter += 1
  return `address-${addressIdCounter}`
}

function DropdownField({
  label,
  valueLabel,
  placeholder = '---',
  isOpen,
  disabled,
  loading,
  fetchError,
  searchValue,
  options,
  onToggle,
  onSelect,
  onSearchChange,
  onFocusSearch,
  containerRef,
  searchInputRef,
  getOptionLabel,
  showOptionCode = true,
}) {
  const visibleOptions = useMemo(() => options, [options])

  return (
    <div className={`account-address-modal__dropdown${disabled ? ' is-disabled' : ''}`} ref={containerRef}>
      <button
        type="button"
        className="account-address-modal__dropdown-trigger"
        onClick={onToggle}
        disabled={disabled}
      >
        <span className="account-address-modal__dropdown-label">{label}</span>
        <strong className="account-address-modal__dropdown-value">{valueLabel || placeholder}</strong>
        <span className="account-address-modal__dropdown-arrow" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen ? (
        <div className="account-address-modal__dropdown-menu">
          <input
            ref={searchInputRef}
            type="text"
            className="account-address-modal__dropdown-search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={onFocusSearch}
            placeholder="Tìm kiếm..."
          />

          <div className="account-address-modal__dropdown-list">
            {loading ? <div className="account-address-modal__dropdown-status">Đang tải...</div> : null}
            {fetchError ? <div className="account-address-modal__dropdown-status">{fetchError}</div> : null}
            {!loading && !fetchError && visibleOptions.length === 0 ? (
              <div className="account-address-modal__dropdown-status">Không tìm thấy</div>
            ) : null}
            {!loading && !fetchError
              ? visibleOptions.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    className="account-address-modal__dropdown-option"
                    onClick={() => onSelect(option)}
                  >
                    <span>{getOptionLabel ? getOptionLabel(option) : option.name}</span>
                    {showOptionCode && option.code ? <small>+{option.code}</small> : null}
                  </button>
                ))
              : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function AccountAddressPage() {
  const currentUser = getAuthUser()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [, setRefreshTick] = useState(0)
  const [countrySearch, setCountrySearch] = useState('')
  const [provinceSearch, setProvinceSearch] = useState('')
  const [districtSearch, setDistrictSearch] = useState('')
  const [wardSearch, setWardSearch] = useState('')
  const [countryOptions] = useState(COUNTRY_OPTIONS)
  const [provinceOptions, setProvinceOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [wardOptions, setWardOptions] = useState([])
  const [provinceLoading, setProvinceLoading] = useState(false)
  const [districtLoading, setDistrictLoading] = useState(false)
  const [wardLoading, setWardLoading] = useState(false)
  const [provinceError, setProvinceError] = useState('')
  const [districtError, setDistrictError] = useState('')
  const [wardError, setWardError] = useState('')
  const [formValues, setFormValues] = useState(EMPTY_FORM_VALUES)

  const countryRef = useRef(null)
  const provinceRef = useRef(null)
  const districtRef = useRef(null)
  const wardRef = useRef(null)
  const countrySearchRef = useRef(null)
  const provinceSearchRef = useRef(null)
  const districtSearchRef = useRef(null)
  const wardSearchRef = useRef(null)

  const openModal = (address = null) => {
    setEditingAddressId(address?.id ?? null)
    setFormValues(address ? createFormValuesFromAddress(address) : EMPTY_FORM_VALUES)
    setCountrySearch('')
    setProvinceSearch('')
    setDistrictSearch('')
    setWardSearch('')
    setProvinceError('')
    setDistrictError('')
    setWardError('')
    setActiveDropdown(null)
    setIsModalOpen(true)
  }
  const closeModal = () => {
    setIsModalOpen(false)
    setActiveDropdown(null)
    setEditingAddressId(null)
    setFormValues(EMPTY_FORM_VALUES)
    setCountrySearch('')
    setProvinceSearch('')
    setDistrictSearch('')
    setWardSearch('')
    setProvinceError('')
    setDistrictError('')
    setWardError('')
  }

  useEffect(() => {
    function handleClickOutside(event) {
      const activeRef = activeDropdown === 'country'
        ? countryRef
        : activeDropdown === 'province'
          ? provinceRef
          : activeDropdown === 'district'
            ? districtRef
            : activeDropdown === 'ward'
              ? wardRef
              : null

      if (activeRef?.current && !activeRef.current.contains(event.target)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeDropdown])

  useEffect(() => {
    if (activeDropdown === 'country') {
      countrySearchRef.current?.focus()
    } else if (activeDropdown === 'province') {
      provinceSearchRef.current?.focus()
    } else if (activeDropdown === 'district') {
      districtSearchRef.current?.focus()
    } else if (activeDropdown === 'ward') {
      wardSearchRef.current?.focus()
    }
  }, [activeDropdown])

  useEffect(() => {
    let isMounted = true

    async function loadProvinces() {
      if (!isModalOpen || formValues.countryCode !== 'VN') {
        return
      }

      setProvinceLoading(true)
      setProvinceError('')

      try {
        const provinces = await getProvinces()
        if (!isMounted) return
        setProvinceOptions(provinces)
      } catch {
        if (!isMounted) return
        setProvinceError('Không tải được danh sách, vui lòng thử lại')
      } finally {
        if (isMounted) {
          setProvinceLoading(false)
        }
      }
    }

    void loadProvinces()

    return () => {
      isMounted = false
    }
  }, [formValues.countryCode, isModalOpen])

  useEffect(() => {
    let isMounted = true

    async function loadDistricts() {
      if (!formValues.provinceCode) {
        setDistrictOptions([])
        return
      }

      setDistrictLoading(true)
      setDistrictError('')

      try {
        const districts = await getDistrictsByProvinceCode(formValues.provinceCode)
        if (!isMounted) return
        setDistrictOptions(districts)
      } catch {
        if (!isMounted) return
        setDistrictError('Không tải được danh sách, vui lòng thử lại')
      } finally {
        if (isMounted) {
          setDistrictLoading(false)
        }
      }
    }

    void loadDistricts()

    return () => {
      isMounted = false
    }
  }, [formValues.provinceCode])

  useEffect(() => {
    let isMounted = true

    async function loadWards() {
      if (!formValues.districtCode) {
        setWardOptions([])
        return
      }

      setWardLoading(true)
      setWardError('')

      try {
        const wards = await getWardsByDistrictCode(formValues.districtCode)
        if (!isMounted) return
        setWardOptions(wards)
      } catch {
        if (!isMounted) return
        setWardError('Không tải được danh sách, vui lòng thử lại')
      } finally {
        if (isMounted) {
          setWardLoading(false)
        }
      }
    }

    void loadWards()

    return () => {
      isMounted = false
    }
  }, [formValues.districtCode])

  const visibleCountries = useMemo(() => filterOptions(countryOptions, countrySearch), [countryOptions, countrySearch])
  const visibleProvinces = useMemo(() => filterOptions(provinceOptions, provinceSearch), [provinceOptions, provinceSearch])
  const visibleDistricts = useMemo(() => filterOptions(districtOptions, districtSearch), [districtOptions, districtSearch])
  const visibleWards = useMemo(() => filterOptions(wardOptions, wardSearch), [wardOptions, wardSearch])

  const handleSelectCountry = (country) => {
    setFormValues((current) => ({
      ...current,
      countryCode: country.code,
      countryName: country.name,
      provinceCode: '',
      provinceName: '',
      districtCode: '',
      districtName: '',
      wardCode: '',
      wardName: '',
    }))
    setCountrySearch('')
    setProvinceSearch('')
    setDistrictSearch('')
    setWardSearch('')
    setActiveDropdown(null)
  }

  const handleSelectProvince = (province) => {
    setFormValues((current) => ({
      ...current,
      provinceCode: province.code,
      provinceName: province.name,
      districtCode: '',
      districtName: '',
      wardCode: '',
      wardName: '',
    }))
    setProvinceSearch('')
    setDistrictSearch('')
    setWardSearch('')
    setActiveDropdown(null)
  }

  const handleSelectDistrict = (district) => {
    setFormValues((current) => ({
      ...current,
      districtCode: district.code,
      districtName: district.name,
      wardCode: '',
      wardName: '',
    }))
    setDistrictSearch('')
    setWardSearch('')
    setActiveDropdown(null)
  }

  const handleSelectWard = (ward) => {
    setFormValues((current) => ({
      ...current,
      wardCode: ward.code,
      wardName: ward.name,
    }))
    setWardSearch('')
    setActiveDropdown(null)
  }

  const handleSaveAddress = () => {
    const nextAddress = {
      id: createAddressId(editingAddressId),
      ...formValues,
      fullName: String(formValues.fullName).trim(),
      phone: String(formValues.phone).trim(),
      company: String(formValues.company).trim(),
      address: String(formValues.address).trim(),
      zip: String(formValues.zip).trim(),
      defaultAddress: Boolean(formValues.defaultAddress),
      createdAt: new Date().toISOString(),
    }

    const remainingAddresses = addresses.filter((address) => address.id !== nextAddress.id)
    const nextAddresses = [nextAddress, ...remainingAddresses]
    const hasRequestedDefault = Boolean(nextAddress.defaultAddress)
    const hasExistingDefault = remainingAddresses.some((address) => address.defaultAddress)

    const finalAddresses = hasRequestedDefault
      ? nextAddresses.map((address) => ({
          ...address,
          defaultAddress: address.id === nextAddress.id,
        }))
      : hasExistingDefault
        ? nextAddresses.map((address) => ({
            ...address,
            defaultAddress: address.id === nextAddress.id ? false : address.defaultAddress,
          }))
        : nextAddresses.map((address, index) => ({
            ...address,
            defaultAddress: index === 0,
          }))

    saveAddresses(finalAddresses, currentUser)
    setRefreshTick((current) => current + 1)
    closeModal()
  }

  const handleEditAddress = (address) => {
    openModal(address)
  }

  const handleDeleteAddress = (addressId) => {
    const nextAddresses = addresses.filter((address) => address.id !== addressId)
    saveAddresses(normalizeDefaultAddresses(nextAddresses), currentUser)
    setRefreshTick((current) => current + 1)
  }

  const addresses = loadAddresses(currentUser)
  const addressCount = addresses.length
  const visibleAddresses = useMemo(() => addresses, [addresses])
  const activeAddressTitle = editingAddressId ? 'CHỈNH SỬA ĐỊA CHỈ' : 'THÊM ĐỊA CHỈ MỚI'

  return (
    <div className="account-page">
      <div className="account-page__inner">
        <nav className="account-page__breadcrumb" aria-label="Breadcrumb">
          <Link to={ROUTES.HOME}>Trang chủ</Link>
          <span>/</span>
          <Link to={ROUTES.ACCOUNT}>Tài khoản</Link>
          <span>/</span>
          <strong>Địa chỉ khách hàng</strong>
        </nav>

        <AccountLayout activeMenu="address" user={currentUser} addressCount={addressCount}>
          <section className="account-page__address-panel">
            <h2 className="account-page__panel-title">ĐỊA CHỈ CỦA BẠN</h2>
            <button type="button" className="account-page__address-add-button" onClick={openModal}>
              Thêm địa chỉ
            </button>

            {visibleAddresses.length > 0 ? (
              <div className="account-page__address-list">
                {visibleAddresses.map((address) => (
                  <article key={address.id} className="account-page__address-card">
                    <div className="account-page__address-card-main">
                      <div className="account-page__address-card-header">
                        <h3 className="account-page__address-name">Họ tên: {address.fullName}</h3>
                        {address.defaultAddress ? (
                          <span className="account-page__address-badge">Địa chỉ mặc định</span>
                        ) : null}
                      </div>

                      <p className="account-page__address-line">Địa chỉ: {buildAddressSummary(address)}</p>
                      <p className="account-page__address-line">Số điện thoại: {address.phone}</p>
                      {address.company ? <p className="account-page__address-line">Công ty: {address.company}</p> : null}
                    </div>

                    <div className="account-page__address-card-actions">
                      <button
                        type="button"
                        className="account-page__address-action account-page__address-action--edit"
                        onClick={() => handleEditAddress(address)}
                      >
                        Chỉnh sửa địa chỉ
                      </button>
                      {!address.defaultAddress ? (
                        <button
                          type="button"
                          className="account-page__address-action account-page__address-action--delete"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          Xóa
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </AccountLayout>
      </div>

      {isModalOpen ? (
        <div className="account-address-modal__overlay" role="presentation" onClick={closeModal}>
          <div
            className="account-address-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-address-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="account-address-modal__header">
              <h3 id="account-address-modal-title">{activeAddressTitle}</h3>
              <button
                type="button"
                className="account-address-modal__close"
                aria-label="Đóng"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form className="account-address-modal__form" onSubmit={(event) => { event.preventDefault(); handleSaveAddress(); }}>
              <input
                type="text"
                className="account-address-modal__input"
                placeholder="Họ tên"
                value={formValues.fullName}
                onChange={(event) => setFormValues((current) => ({ ...current, fullName: event.target.value }))}
              />
              <input
                type="tel"
                className="account-address-modal__input"
                placeholder="Số điện thoại"
                value={formValues.phone}
                onChange={(event) => setFormValues((current) => ({ ...current, phone: event.target.value }))}
              />
              <input
                type="text"
                className="account-address-modal__input"
                placeholder="Công ty"
                value={formValues.company}
                onChange={(event) => setFormValues((current) => ({ ...current, company: event.target.value }))}
              />
              <input
                type="text"
                className="account-address-modal__input"
                placeholder="Địa chỉ"
                value={formValues.address}
                onChange={(event) => setFormValues((current) => ({ ...current, address: event.target.value }))}
              />

              <div className="account-address-modal__dropdown-group" ref={countryRef}>
                <DropdownField
                  label="Quốc gia"
                  valueLabel={formValues.countryName}
                  isOpen={activeDropdown === 'country'}
                  searchValue={countrySearch}
                  options={visibleCountries}
                  onToggle={() => setActiveDropdown((current) => (current === 'country' ? null : 'country'))}
                  onSelect={handleSelectCountry}
                  onSearchChange={setCountrySearch}
                  onFocusSearch={() => setActiveDropdown('country')}
                  containerRef={countryRef}
                  searchInputRef={countrySearchRef}
                />
              </div>

              <div className="account-address-modal__row">
                <DropdownField
                  label="Tỉnh thành"
                  valueLabel={formValues.provinceName}
                  disabled={formValues.countryCode !== 'VN'}
                  isOpen={activeDropdown === 'province'}
                  loading={provinceLoading}
                  fetchError={provinceError}
                  searchValue={provinceSearch}
                  options={visibleProvinces}
                  getOptionLabel={(option) => stripProvincePrefix(option.name)}
                  showOptionCode={false}
                  onToggle={() => {
                    if (formValues.countryCode !== 'VN') return
                    setActiveDropdown((current) => (current === 'province' ? null : 'province'))
                  }}
                  onSelect={handleSelectProvince}
                  onSearchChange={setProvinceSearch}
                  onFocusSearch={() => setActiveDropdown('province')}
                  containerRef={provinceRef}
                  searchInputRef={provinceSearchRef}
                />

                <DropdownField
                  label="Quận huyện"
                  valueLabel={formValues.districtName}
                  disabled={!formValues.provinceCode}
                  isOpen={activeDropdown === 'district'}
                  loading={districtLoading}
                  fetchError={districtError}
                  searchValue={districtSearch}
                  options={visibleDistricts}
                  showOptionCode={false}
                  onToggle={() => {
                    if (!formValues.provinceCode) return
                    setActiveDropdown((current) => (current === 'district' ? null : 'district'))
                  }}
                  onSelect={handleSelectDistrict}
                  onSearchChange={setDistrictSearch}
                  onFocusSearch={() => setActiveDropdown('district')}
                  containerRef={districtRef}
                  searchInputRef={districtSearchRef}
                />

                <DropdownField
                  label="Phường xã"
                  valueLabel={formValues.wardName}
                  disabled={!formValues.districtCode}
                  isOpen={activeDropdown === 'ward'}
                  loading={wardLoading}
                  fetchError={wardError}
                  searchValue={wardSearch}
                  options={visibleWards}
                  showOptionCode={false}
                  onToggle={() => {
                    if (!formValues.districtCode) return
                    setActiveDropdown((current) => (current === 'ward' ? null : 'ward'))
                  }}
                  onSelect={handleSelectWard}
                  onSearchChange={setWardSearch}
                  onFocusSearch={() => setActiveDropdown('ward')}
                  containerRef={wardRef}
                  searchInputRef={wardSearchRef}
                />
              </div>

              <input
                type="text"
                className="account-address-modal__input"
                placeholder="Mã Zip"
                value={formValues.zip}
                onChange={(event) => setFormValues((current) => ({ ...current, zip: event.target.value }))}
              />

              <label className="account-address-modal__checkbox">
                <input
                  type="checkbox"
                  checked={formValues.defaultAddress}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      defaultAddress: event.target.checked,
                    }))
                  }
                />
                <span>Đặt là địa chỉ mặc định?</span>
              </label>

              <div className="account-address-modal__footer">
                <button
                  type="button"
                  className="account-address-modal__button account-address-modal__button--secondary"
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button type="submit" className="account-address-modal__button account-address-modal__button--primary">
                  {editingAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
