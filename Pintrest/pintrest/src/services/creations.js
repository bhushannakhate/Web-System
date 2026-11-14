import { apiRequest } from './api'

export async function listCreations(user, filters = {}) {
  const params = new URLSearchParams()
  params.set('limit', String(filters.limit || 12))
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.search?.trim()) params.set('search', filters.search.trim())
  if (filters.from) params.set('from', filters.from)
  if (filters.to) params.set('to', filters.to)
  if (filters.cursor) params.set('cursor', filters.cursor)
  return apiRequest(`/creations?${params.toString()}`, user)
}

export async function getCreation(creationId, user) {
  return apiRequest(`/creations/${encodeURIComponent(creationId)}`, user)
}

export async function getCreationMediaDownloadUrl(creationId, mediaKind, user) {
  return apiRequest(
    `/creations/${encodeURIComponent(creationId)}/media/${encodeURIComponent(mediaKind)}/download-url`,
    user,
  )
}

export async function deleteCreation(creationId, user) {
  return apiRequest(`/creations/${encodeURIComponent(creationId)}`, user, {
    method: 'DELETE',
  })
}
