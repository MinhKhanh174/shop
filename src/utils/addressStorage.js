import { getItem, setItem } from '../storage/localStorage.js'
import { fetchSharedAddresses, saveSharedAddresses } from '../services/accountDataApi'

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

function createAddressFromUserProfile(user) {
  const address = user?.address

  if (!address || typeof address !== 'object') {
    return null
  }

  const fullName = [user?.lastName, user?.firstName].map((value) => String(value ?? '').trim()).filter(Boolean).join(' ').trim()
  const street = String(address.address ?? '').trim()
  const city = String(address.city ?? '').trim()
  const state = String(address.state ?? '').trim()
  const country = String(address.country ?? '').trim()
  const postalCode = String(address.postalCode ?? '').trim()

  const seedAddress = normalizeAddress(
    {
      id: `api-address-${String(user?.id ?? user?.email ?? 'guest').trim()}`,
      fullName: fullName || String(user?.firstName ?? user?.username ?? '').trim(),
      phone: String(user?.phone ?? '').trim(),
      company: String(user?.company?.name ?? '').trim(),
      address: street,
      countryCode: country ? country.toUpperCase().slice(0, 2) : 'VN',
      countryName: country || 'Vietnam',
      provinceCode: state,
      provinceName: state,
      districtCode: city,
      districtName: city,
      wardCode: '',
      wardName: '',
      zip: postalCode,
      defaultAddress: true,
      createdAt: user?.updatedAt ?? user?.birthDate ?? new Date().toISOString(),
    },
    0,
  )

  return seedAddress
}

function mergeUserAddressSeed(addresses, user) {
  const seedAddress = createAddressFromUserProfile(user)

  if (!seedAddress) {
    return addresses
  }

  const hasSeedAddress = addresses.some((address) => address.id === seedAddress.id)
  const nextAddresses = hasSeedAddress ? addresses : [seedAddress, ...addresses]

  const defaultIndex = nextAddresses.findIndex((address) => address.defaultAddress)

  if (defaultIndex >= 0) {
    return nextAddresses.map((address, index) => ({
      ...address,
      defaultAddress: index === defaultIndex,
    }))
  }

  return nextAddresses.map((address, index) => ({
    ...address,
    defaultAddress: index === 0,
  }))
}

function normalizeAddressCollection(addresses) {
  const normalized = Array.isArray(addresses) ? addresses.map((address, index) => normalizeAddress(address, index)) : []

  if (!normalized.length) {
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

export function loadAddresses(user = null) {
  const scopedKey = getAddressStorageKey(user)
  const addresses = getItem(scopedKey, [])
  const normalized = normalizeAddressCollection(addresses)

  if (!normalized.length) {
    const apiSeedAddress = user ? createAddressFromUserProfile(user) : null

    if (apiSeedAddress) {
      const seededAddresses = mergeUserAddressSeed([], user)
      saveAddresses(seededAddresses, user)
      return seededAddresses
    }

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

  if (user) {
    const mergedAddresses = mergeUserAddressSeed(normalized, user)

    if (mergedAddresses.length !== normalized.length || mergedAddresses.some((address, index) => address.id !== normalized[index]?.id)) {
      saveAddresses(mergedAddresses, user)
      return mergedAddresses
    }
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
  const normalized = normalizeAddressCollection(addresses)
  setItem(getAddressStorageKey(user), normalized)

  const userEmail = String(user?.email ?? '').trim().toLowerCase()

  if (userEmail) {
    void saveSharedAddresses(userEmail, normalized).catch((error) => {
      console.error('addressStorage saveSharedAddresses failed', error)
    })
  }

  return normalized
}

export async function syncAddressesFromRemote(user = null) {
  if (!user) {
    return loadAddresses(null)
  }

  const userEmail = String(user?.email ?? '').trim().toLowerCase()
  const scopedKey = getAddressStorageKey(user)
  const localAddresses = loadAddresses(user)

  if (!userEmail) {
    return localAddresses
  }

  try {
    const remoteAddresses = await fetchSharedAddresses(userEmail)

    if (Array.isArray(remoteAddresses) && remoteAddresses.length > 0) {
      const normalizedRemote = normalizeAddressCollection(remoteAddresses)
      setItem(scopedKey, normalizedRemote)
      return normalizedRemote
    }

    if (localAddresses.length > 0) {
      const normalizedLocal = normalizeAddressCollection(localAddresses)
      await saveSharedAddresses(userEmail, normalizedLocal)
      setItem(scopedKey, normalizedLocal)
      return normalizedLocal
    }

    const apiSeedAddress = createAddressFromUserProfile(user)

    if (apiSeedAddress) {
      const seededAddresses = mergeUserAddressSeed([], user)
      await saveSharedAddresses(userEmail, seededAddresses)
      setItem(scopedKey, seededAddresses)
      return seededAddresses
    }
  } catch (error) {
    console.error('addressStorage syncAddressesFromRemote failed', error)
  }

  return localAddresses
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
