import { useEffect, useState } from 'react'
import { AdminAccessContext } from './adminAccessContext'
import { useAuth } from './useAuth'
import { apiRequest } from '../services/api'

export function AdminAccessProvider({ children }) {
  const { user } = useAuth()
  const [adminAccessState, setAdminAccessState] = useState({
    userId: '',
    isAdmin: false,
    loading: false,
    error: '',
  })
  const adminAccess = !user
    ? { isAdmin: false, loading: false, error: '' }
    : adminAccessState.userId === user.uid
      ? adminAccessState
      : { isAdmin: false, loading: true, error: '' }

  useEffect(() => {
    if (!user) return undefined

    let ignoreResult = false
    apiRequest('/users/me', user)
      .then(({ isAdmin }) => {
        if (!ignoreResult) {
          setAdminAccessState({
            userId: user.uid,
            isAdmin: isAdmin === true,
            loading: false,
            error: '',
          })
        }
      })
      .catch((error) => {
        if (!ignoreResult) {
          setAdminAccessState({
            userId: user.uid,
            isAdmin: false,
            loading: false,
            error: error.message,
          })
        }
      })

    return () => {
      ignoreResult = true
    }
  }, [user])

  return (
    <AdminAccessContext.Provider value={adminAccess}>
      {children}
    </AdminAccessContext.Provider>
  )
}
