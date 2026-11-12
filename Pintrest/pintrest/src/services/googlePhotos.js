import { apiRequest } from './api'

export async function getGooglePhotosConnection(user) {
  return apiRequest('/google-photos/connection', user)
}

export async function getGooglePhotosAuthorizationUrl(user) {
  return apiRequest('/google-photos/oauth/authorize', user, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function disconnectGooglePhotos(user) {
  return apiRequest('/google-photos/connection', user, { method: 'DELETE' })
}

export async function createGooglePhotosDraft(user) {
  const { creation } = await apiRequest('/creations', user, {
    method: 'POST',
    body: JSON.stringify({ status: 'draft' }),
  })
  return creation
}

export async function createGooglePhotosPickerSession(creationId, user) {
  const { session } = await apiRequest(
    `/creations/${encodeURIComponent(creationId)}/google-photos/sessions`,
    user,
    { method: 'POST', body: JSON.stringify({}) },
  )
  return session
}

export async function pollGooglePhotosPickerSession(sessionId, user) {
  return apiRequest(
    `/google-photos/sessions/${encodeURIComponent(sessionId)}`,
    user,
  )
}

export async function listGooglePhotosPickerItems(sessionId, user) {
  return apiRequest(
    `/google-photos/sessions/${encodeURIComponent(sessionId)}/media-items`,
    user,
  )
}

export async function importGooglePhotosItem(
  creationId,
  sessionId,
  mediaItemId,
  user,
) {
  const { media } = await apiRequest(
    `/creations/${encodeURIComponent(creationId)}/google-photos/sessions/${encodeURIComponent(sessionId)}/import`,
    user,
    {
      method: 'POST',
      body: JSON.stringify({ mediaItemId }),
    },
  )
  const download = await apiRequest(
    `/creations/${encodeURIComponent(creationId)}/media/sourceImage/download-url`,
    user,
  )
  return { media, downloadUrl: download.downloadUrl }
}

export async function deleteGooglePhotosPickerSession(sessionId, user) {
  return apiRequest(
    `/google-photos/sessions/${encodeURIComponent(sessionId)}`,
    user,
    { method: 'DELETE' },
  )
}

export async function deleteGooglePhotosDraft(creationId, user) {
  return apiRequest(`/creations/${encodeURIComponent(creationId)}`, user, {
    method: 'DELETE',
  })
}
