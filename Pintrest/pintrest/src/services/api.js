const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export async function apiRequest(path, user, options = {}) {
  if (!user) throw new Error('Sign in before requesting account data.')

  let token
  try {
    token = await user.getIdToken()
  } catch {
    throw new Error('Your sign-in could not be refreshed. Sign in again and retry.')
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new Error('Could not reach the Pinboard Studio API. Check your connection and try again.')
  }

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'The API could not complete this request.')
  }
  return payload
}
