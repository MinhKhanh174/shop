import { getItem, setItem } from '../storage/localStorage.js'

const LEGACY_ADDRESSES_KEY = 'techstore_addresses'

function isTruthyDefault(address) {
  return Boolean(address?.defaultAddress)
}

export function getAddressStorageKey(user) {
  const email = String(user?.email ?? '').trim().toLowerCase()
  const id = String(user?.id ?? '').trim()
  const username = String(user?.username ?? '').trim().toLowerCase()
  let scope = 'guest'

  if (email) {
    scope = email
  } else if (id) {
    scope = `id_${id}`
  } else if (username) {
    scope = username
  }

  return `techstore_addresses_${scope}`
}

function normalizeAddress(address, index = 0) {
  return {
    id: String(address?.id ?? `address-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`),
    fullName: String(address?.fullName ?? '').trim(),
    phone: String(address?.phone ?? '').trim(),
    company: String(address?.company ?? '').trim(),
    address: String(address?.address ?? '').trim(),
    countryCode: String(address?.countryCode ?? 'VN').trim(),
    countryName: String(address?.countryName ?? 'Vietnam').trim(),
    provinceCode: String(address?.provinceCode ?? '').trim(),
    provinceName: String(address?.provinceName ?? '').trim(),
    districtCode: String(address?.districtCode ?? '').trim(),
    districtName: String(address?.districtName ?? '').trim(),
    wardCode: String(address?.wardCode ?? '').trim(),
    wardName: String(address?.wardName ?? '').trim(),
    zip: String(address?.zip ?? '').trim(),
    defaultAddress: isTruthyDefault(address),
    createdAt: address?.createdAt ?? new Date().toISOString(),
  }
}

export function loadAddresses(user = null) {
  const scopedKey = getAddressStorageKey(user)
  const addresses = getItem(scopedKey, [])
  const normalized = Array.isArray(addresses) ? addresses.map((address, index) => normalizeAddress(address, index)) : []

  if (!normalized.length) {
    if (!user) {
      const legacyAddresses = getItem(LEGACY_ADDRESSES_KEY, [])
      const normalizedLegacy = Array.isArray(legacyAddresses)
        ? legacyAddresses.map((address, index) => normalizeAddress(address, index))
        : []

      if (normalizedLegacy.length) {
        saveAddresses(normalizedLegacy, user)
        return normalizedLegacy
      }
    }

    return normalized
  }

  const defaultIndex = normalized.findIndex((address) => address.defaultAddress)

  if (defaultIndex >= 0) {
    return normalized.map((address, index) => ({
      ...address,
      defaultAddress: index === defaultIndex,
    }))
  }

  return normalized.map((address, index) => ({
    ...address,
    defaultAddress: index === 0,
  }))
}

export function saveAddresses(addresses, user = null) {
  const normalized = Array.isArray(addresses) ? addresses.map((address, index) => normalizeAddress(address, index)) : []
  setItem(getAddressStorageKey(user), normalized)
  return normalized
}

export function createAddressDraft(values, existingId = null) {
  return normalizeAddress(
    {
      ...values,
      id: existingId ?? undefined,
    },
    0,
  )
}
