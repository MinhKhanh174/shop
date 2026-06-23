import { ROUTES } from '../constants/routes'

export const COLLECTION_FEATURED_SLUG = 'featured'
export const COLLECTION_AUDIO_SLUG = 'audio'
export const COLLECTION_WATCH_SLUG = 'watch'
export const COLLECTION_ACCESSORIES_SLUG = 'accessories'

export function normalizeCollectionSlug(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export function getCategoryCollectionPath(categorySlug) {
  const normalized = normalizeCollectionSlug(categorySlug)
  const safeSlug = normalized || COLLECTION_FEATURED_SLUG

  return `${ROUTES.CATEGORIES}/${encodeURIComponent(safeSlug)}`
}
