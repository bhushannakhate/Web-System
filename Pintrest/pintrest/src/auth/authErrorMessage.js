const AUTH_ERROR_MESSAGES = {
  'auth/email-already-in-use': 'An account already exists for this email. Try signing in instead.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/invalid-credential': 'That email and password combination was not recognized.',
  'auth/user-not-found': 'That email and password combination was not recognized.',
  'auth/wrong-password': 'That email and password combination was not recognized.',
  'auth/weak-password': 'Choose a password with at least six characters.',
  'auth/too-many-requests': 'Too many attempts. Wait a little while, then try again.',
  'auth/popup-blocked': 'Your browser blocked the Google sign-in window. Allow pop-ups and try again.',
  'auth/popup-closed-by-user': 'The Google sign-in window was closed before sign-in completed.',
  'auth/network-request-failed': 'A network error interrupted sign-in. Check your connection and try again.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled for the Firebase project.',
}

export function authErrorMessage(error) {
  return AUTH_ERROR_MESSAGES[error?.code] || 'We could not complete that request. Please try again.'
}
