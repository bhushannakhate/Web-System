import { apiRequest } from './api'

const MAX_AUDIO_BYTES = 25 * 1024 * 1024
const AUDIO_CONTENT_TYPES = new Set([
  'audio/mpeg',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
])

export async function uploadCreationAudio(creationId, audioFile, user) {
  if (!AUDIO_CONTENT_TYPES.has(audioFile.type)) {
    throw new Error('Use an MP3, M4A, OGG, WAV, or WebM audio recording.')
  }
  if (!audioFile.size || audioFile.size > MAX_AUDIO_BYTES) {
    throw new Error('Choose a non-empty audio file smaller than 25 MB.')
  }

  const { upload } = await apiRequest(
    `/creations/${encodeURIComponent(creationId)}/media/audio/uploads`,
    user,
    {
      method: 'POST',
      body: JSON.stringify({
        contentType: audioFile.type,
        sizeBytes: audioFile.size,
      }),
    },
  )

  let response
  try {
    response = await fetch(upload.uploadUrl, {
      method: upload.method,
      headers: upload.headers,
      body: audioFile,
    })
  } catch {
    throw new Error('The audio could not be uploaded to secure storage. Check your connection and retry.')
  }
  if (!response.ok) {
    throw new Error('Secure storage rejected the audio upload. Please retry.')
  }

  await apiRequest(
    `/creations/${encodeURIComponent(creationId)}/media/uploads/${encodeURIComponent(upload.uploadId)}/complete`,
    user,
    { method: 'POST' },
  )
}

export function runAgentWorkflow(
  creationId,
  instructions,
  user,
  includeAudio,
) {
  return apiRequest(
    `/creations/${encodeURIComponent(creationId)}/agent-workflows`,
    user,
    {
      method: 'POST',
      body: JSON.stringify({ instructions, includeAudio }),
    },
  )
}

export async function getGeneratedImageUrl(creationId, user) {
  const download = await apiRequest(
    `/creations/${encodeURIComponent(creationId)}/media/outputImage/download-url`,
    user,
  )
  return download.downloadUrl
}
