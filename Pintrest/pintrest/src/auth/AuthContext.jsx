import { useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import { firebaseAuth, firebaseConfigError } from './firebaseClient'
import { AuthContext } from './authContextStore'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(firebaseAuth))

  useEffect(() => {
    if (!firebaseAuth) return undefined

    return onIdTokenChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
  }, [])

  async function signIn(email, password) {
    const result = await signInWithEmailAndPassword(firebaseAuth, email, password)
    return result.user
  }

  async function register(displayName, email, password) {
    const result = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    await updateProfile(result.user, { displayName: displayName.trim() })
    setUser(firebaseAuth.currentUser)
    return result.user
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    const result = await signInWithPopup(firebaseAuth, provider)
    return result.user
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(firebaseAuth, email)
  }

  function signOut() {
    return firebaseSignOut(firebaseAuth)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        configurationError: firebaseConfigError,
        signIn,
        register,
        signInWithGoogle,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
