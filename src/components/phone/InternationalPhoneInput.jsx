import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { FlagImage, defaultCountries, parseCountry, usePhoneInput } from 'react-international-phone'
import './InternationalPhoneInput.css'

const DEFAULT_COUNTRY = 'vn'
const PARSED_COUNTRIES = defaultCountries.map((country) => parseCountry(country))

function getCountryByIso2(iso2) {
  return PARSED_COUNTRIES.find((country) => country.iso2 === iso2) ?? PARSED_COUNTRIES[0]
}

function normalizeSearchValue(value) {
  return String(value ?? '').trim().toLowerCase()
}

export function InternationalPhoneInput({
  value = '',
  onChange,
  disabled = false,
  readOnly = false,
  placeholder = 'Số điện thoại',
  className = '',
  inputClassName = '',
  variant = 'checkout',
  name,
  id,
  autoComplete = 'tel',
  onBlur,
  onFocus,
  error = '',
}) {
  const rootRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const isLocked = disabled || readOnly

  const { inputValue, country, setCountry, handlePhoneValueChange, inputRef } = usePhoneInput({
    defaultCountry: DEFAULT_COUNTRY,
    value,
    countries: defaultCountries,
    preferredCountries: [DEFAULT_COUNTRY],
    disableDialCodePrefill: true,
    disableDialCodeAndPrefix: true,
    disableFormatting: true,
    forceDialCode: true,
    onChange: ({ phone: nextPhone }) => {
      onChange?.(nextPhone)
    },
  })

  const selectedCountry = country ?? getCountryByIso2(DEFAULT_COUNTRY)

  const filteredCountries = useMemo(() => {
    const query = normalizeSearchValue(searchTerm)

    const matchedCountries = PARSED_COUNTRIES.filter((countryItem) => {
      if (!query) {
        return true
      }

      return (
        countryItem.name.toLowerCase().includes(query) ||
        `+${countryItem.dialCode}`.includes(query) ||
        countryItem.iso2.includes(query)
      )
    })

    return [...matchedCountries].sort((a, b) => {
      if (a.iso2 === DEFAULT_COUNTRY) return -1
      if (b.iso2 === DEFAULT_COUNTRY) return 1
      return a.name.localeCompare(b.name, 'en')
    })
  }, [searchTerm])

  useEffect(() => {
    const handleDocumentMouseDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleDocumentKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleDocumentMouseDown)
    document.addEventListener('keydown', handleDocumentKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown)
      document.removeEventListener('keydown', handleDocumentKeyDown)
    }
  }, [])

  const toggleMenu = () => {
    if (isLocked) {
      return
    }

    setSearchTerm('')
    setIsOpen((current) => !current)
  }

  const selectCountry = (iso2) => {
    setCountry(iso2, { focusOnInput: true })
    setIsOpen(false)
    setSearchTerm('')
  }

  const rootClassName = ['phone-input', `phone-input--${variant}`, className].filter(Boolean).join(' ')

  return (
    <div className={rootClassName} ref={rootRef}>
      <button
        type="button"
        className="phone-input__selector"
        aria-label={`Chọn mã quốc gia, hiện tại là ${selectedCountry.name} +${selectedCountry.dialCode}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={toggleMenu}
        disabled={isLocked}
      >
        <span className="phone-input__flag" aria-hidden="true">
          <FlagImage iso2={selectedCountry.iso2} size={18} />
        </span>
        <span className="phone-input__code">+{selectedCountry.dialCode}</span>
        <ChevronDown size={14} className="phone-input__chevron" aria-hidden="true" />
      </button>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="tel"
        className={`phone-input__field${error ? ' is-invalid' : ''} ${inputClassName}`.trim()}
        value={inputValue}
        onChange={handlePhoneValueChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={error ? 'true' : 'false'}
      />

      {isOpen ? (
        <div className="phone-input__dropdown" role="dialog" aria-label="Danh sách quốc gia">
          <label className="phone-input__search">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm quốc gia"
              autoFocus
            />
          </label>

          <div className="phone-input__list" role="listbox" aria-label="Danh sách mã quốc gia">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((countryItem) => {
                const isSelected = countryItem.iso2 === selectedCountry.iso2

                return (
                  <button
                    key={countryItem.iso2}
                    type="button"
                    className={`phone-input__option${isSelected ? ' is-selected' : ''}`}
                    onClick={() => selectCountry(countryItem.iso2)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="phone-input__option-name">{countryItem.name}</span>
                    <span className="phone-input__option-code">+{countryItem.dialCode}</span>
                  </button>
                )
              })
            ) : (
              <div className="phone-input__empty">Không tìm thấy quốc gia phù hợp.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
