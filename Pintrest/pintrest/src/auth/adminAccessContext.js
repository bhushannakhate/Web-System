import { createContext } from 'react'

export const AdminAccessContext = createContext({
  isAdmin: false,
  loading: false,
  error: '',
})
