import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { ROUTES } from '../../constants/routes'
import { DEMO_AUTH_ENABLED } from '../../config/demoAuth'
import { getAuthToken, getAuthUser, hasAuthSession, isAdminUser } from '../../utils/authStorage'
import AdminAccessDeniedPage from '../pages/AdminAccessDeniedPage'

export default function RequireAdmin() {
  const location = useLocation()
  const user = getAuthUser()
  const authToken = getAuthToken()
  const hasSession = hasAuthSession() && Boolean(authToken) && Boolean(user)

  if (!hasSession) {
    return <Navigate to={ROUTES.LOGIN_LEGACY} replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  if (!DEMO_AUTH_ENABLED) {
    return <AdminAccessDeniedPage />
  }

  if (!isAdminUser(user)) {
    // FE-only demo guard: production must verify role on the backend before allowing admin access.
    return <AdminAccessDeniedPage />
  }

  return <Outlet />
}
