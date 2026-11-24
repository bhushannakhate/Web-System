import { apiRequest } from './api'
import { runAgentWorkflow } from './agentWorkflow'

export async function listUserCreations(user, filters = {}, cursor) {
  const query = new URLSearchParams({ limit: '12' })
  for (const [key, value] of Object.entries(filters)) {
    if (value) query.set(key, value)
  }
  if (cursor) query.set('cursor', cursor)
  return apiRequest(`/creations?${query}`, user)
}

export async function getCreationMediaDownloadUrl(
  creationId,
  mediaKind,
  user,
  download = false,
) {
  return apiRequest(
    `/creations/${encodeURIComponent(creationId)}/media/${encodeURIComponent(mediaKind)}/download-url${download ? '?download=true' : ''}`,
    user,
  )
}

export async function deleteUserCreation(creationId, user) {
  return apiRequest(`/creations/${encodeURIComponent(creationId)}`, user, {
    method: 'DELETE',
  })
}

export function retryUserCreation(creation, instructions, user, includeAudio) {
  return runAgentWorkflow(creation.id, instructions, user, includeAudio)
}
