import { parsePhoneNumberFromString } from 'libphonenumber-js'

export function normalizePhoneToE164(phone) {
  const normalized = String(phone ?? '').trim()

  if (!normalized) {
    return ''
  }

  const parsed = parsePhoneNumberFromString(normalized)
  return parsed?.format('E.164') ?? normalized
}

export function isValidE164PhoneNumber(phone) {
  const normalized = String(phone ?? '').trim()

  if (!normalized) {
    return false
  }

  const parsed = parsePhoneNumberFromString(normalized)
  return Boolean(parsed?.isValid())
}
