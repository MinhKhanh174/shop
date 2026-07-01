import { syncAddressesFromRemote } from './addressStorage'
import { getAuthToken, getAuthUser, setAuthSession } from './authStorage'

function normalizeText(value) {
  return String(value ?? '').trim()
}

function mergeAuthUsers(primaryUser, remoteUser) {
  if (!primaryUser && !remoteUser) {
    return null
  }

  if (!remoteUser) {
    return primaryUser ?? null
  }

  if (!primaryUser) {
    return remoteUser ?? null
  }

  return {
    ...remoteUser,
    ...primaryUser,
    id: primaryUser.id ?? remoteUser.id ?? null,
    name: normalizeText(primaryUser.name) || normalizeText(remoteUser.name),
    username: normalizeText(primaryUser.username) || normalizeText(remoteUser.username),
    firstName: normalizeText(primaryUser.firstName) || normalizeText(remoteUser.firstName),
    lastName: normalizeText(primaryUser.lastName) || normalizeText(remoteUser.lastName),
    phone: normalizeText(primaryUser.phone) || normalizeText(remoteUser.phone),
    email: normalizeText(primaryUser.email) || normalizeText(remoteUser.email),
    avatar: normalizeText(primaryUser.avatar) || normalizeText(remoteUser.avatar),
    company: primaryUser.company ?? remoteUser.company ?? null,
    address: primaryUser.address ?? remoteUser.address ?? null,
    accessToken: normalizeText(primaryUser.accessToken) || normalizeText(remoteUser.accessToken),
    refreshToken: normalizeText(primaryUser.refreshToken) || normalizeText(remoteUser.refreshToken),
  }
}

async function hydrateDependentStores(user) {
  if (typeof window === 'undefined') {
    return
  }

  const [{ useCartStore }, { useWishlistStore }] = await Promise.all([
    import('../store/useCartStore'),
    import('../store/useWishlistStore'),
  ])

  await Promise.all([
    useCartStore.getState().rehydrateCart(user),
    Promise.resolve(useWishlistStore.getState().rehydrateWishlist(user)),
  ])
}

export async function bootstrapAuthSession(options = {}) {
  const currentUser = options.user ?? getAuthUser()

  if (!currentUser) {
    return null
  }

  const currentToken = normalizeText(options.accessToken ?? currentUser.accessToken ?? getAuthToken())
  const nextUser = mergeAuthUsers(currentUser, null)

  if (nextUser) {
    setAuthSession(nextUser, {
      accessToken: currentToken || nextUser.accessToken,
      refreshToken: options.refreshToken ?? currentUser.refreshToken ?? nextUser.refreshToken,
    })

    await syncAddressesFromRemote(nextUser)
    await hydrateDependentStores(nextUser)
  }

  return nextUser
}
