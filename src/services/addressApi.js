const ADDRESS_API_BASE = 'https://provinces.open-api.vn/api/v1'
const REQUEST_TIMEOUT_MS = 10000

const provinceListCache = new Map()
const provinceDetailCache = new Map()
const districtDetailCache = new Map()

function createTimeoutSignal(timeoutMs) {
  if (typeof AbortController === 'undefined') {
    return { signal: undefined, cancel: () => {} }
  }

  const controller = new AbortController()
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs)

  return {
    signal: controller.signal,
    cancel: () => globalThis.clearTimeout(timeoutId),
  }
}

async function requestJson(path) {
  const { signal, cancel } = createTimeoutSignal(REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${ADDRESS_API_BASE}${path}`, {
      signal,
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    return await response.json()
  } finally {
    cancel()
  }
}

function normalizeDivisionName(value) {
  return String(value ?? '').trim()
}

function normalizeCode(value) {
  return String(value ?? '').trim()
}

function sortAddressOptions(options, priorityNames = []) {
  const priorityMap = new Map(priorityNames.map((name, index) => [name, index]))

  return [...options].sort((left, right) => {
    const leftPriority = priorityMap.has(left.name) ? priorityMap.get(left.name) : Number.POSITIVE_INFINITY
    const rightPriority = priorityMap.has(right.name) ? priorityMap.get(right.name) : Number.POSITIVE_INFINITY

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority
    }

    return left.name.localeCompare(right.name, 'vi', { sensitivity: 'base' })
  })
}

function toProvinceOption(province) {
  return {
    code: normalizeCode(province.code),
    name: normalizeDivisionName(province.name),
  }
}

function toDistrictOption(district) {
  return {
    code: normalizeCode(district.code),
    name: normalizeDivisionName(district.name),
    provinceCode: normalizeCode(district.province_code),
  }
}

function toWardOption(ward) {
  return {
    code: normalizeCode(ward.code),
    name: normalizeDivisionName(ward.name),
    provinceCode: normalizeCode(ward.province_code),
    districtCode: normalizeCode(ward.district_code),
  }
}

export async function getProvinces() {
  if (provinceListCache.has('list')) {
    return provinceListCache.get('list')
  }

  const data = await requestJson('/?depth=2')
  const provinces = sortAddressOptions(
    Array.isArray(data) ? data.map(toProvinceOption).filter((province) => province.name && province.name !== '---') : [],
    ['Hà Nội', 'TP Hồ Chí Minh'],
  )

  provinceListCache.set('list', provinces)

  return provinces
}

export async function getDistrictsByProvinceCode(provinceCode) {
  const normalizedProvinceCode = normalizeCode(provinceCode)

  if (!normalizedProvinceCode) {
    return []
  }

  if (provinceDetailCache.has(normalizedProvinceCode)) {
    return provinceDetailCache.get(normalizedProvinceCode)
  }

  const provinces = await getProvinces()
  const cachedProvince = provinces.find((province) => province.code === normalizedProvinceCode)

  if (cachedProvince && Array.isArray(cachedProvince.districts)) {
    const districts = sortAddressOptions(cachedProvince.districts.map(toDistrictOption).filter((district) => district.name))
    provinceDetailCache.set(normalizedProvinceCode, districts)
    return districts
  }

  const data = await requestJson(`/p/${normalizedProvinceCode}?depth=2`)
  const districts = sortAddressOptions(
    Array.isArray(data?.districts) ? data.districts.map(toDistrictOption).filter((district) => district.name) : [],
  )

  provinceDetailCache.set(normalizedProvinceCode, districts)

  return districts
}

export async function getWardsByDistrictCode(districtCode) {
  const normalizedDistrictCode = normalizeCode(districtCode)

  if (!normalizedDistrictCode) {
    return []
  }

  if (districtDetailCache.has(normalizedDistrictCode)) {
    return districtDetailCache.get(normalizedDistrictCode)
  }

  const data = await requestJson(`/d/${normalizedDistrictCode}?depth=2`)
  const wards = sortAddressOptions(Array.isArray(data?.wards) ? data.wards.map(toWardOption).filter((ward) => ward.name) : [])

  districtDetailCache.set(normalizedDistrictCode, wards)

  return wards
}
