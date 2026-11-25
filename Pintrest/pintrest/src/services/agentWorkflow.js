import { apiRequest } from './api'
import { getGaRequestHeaders, trackAgentWorkflowStarted } from './analytics'

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

export async function transcribeCreationAudio(creationId, user) {
  const result = await apiRequest(
    `/creations/${encodeURIComponent(creationId)}/transcription`,
    user,
    { method: 'POST', body: JSON.stringify({}) },
  )
  return result.transcription
}

export async function saveCreationTranscript(creationId, transcript, user) {
  const result = await apiRequest(
    `/creations/${encodeURIComponent(creationId)}/transcription`,
    user,
    {
      method: 'PATCH',
      body: JSON.stringify({ transcript }),
    },
  )
  return result.transcription
}

export function runAgentWorkflow(
  creationId,
  instructions,
  user,
  includeAudio,
  transcript,
  consentToGemini,
) {
  trackAgentWorkflowStarted(includeAudio)
  return getGaRequestHeaders().then((analyticsHeaders) =>
    apiRequest(
      `/creations/${encodeURIComponent(creationId)}/agent-workflows`,
      user,
      {
        method: 'POST',
        headers: analyticsHeaders,
        body: JSON.stringify({
          instructions,
          includeAudio,
          transcript,
          consentToGemini,
        }),
      },
    ),
  )
}

export async function getGeneratedImageUrl(creationId, user) {
  const download = await apiRequest(
    `/creations/${encodeURIComponent(creationId)}/media/outputImage/download-url`,
    user,
  )
  return download.downloadUrl
}

export async function reviewCreation(creationId, action, instruction, user) {
  const result = await apiRequest(
    `/creations/${encodeURIComponent(creationId)}/review`,
    user,
    {
      method: 'POST',
      body: JSON.stringify({
        action,
        ...(instruction?.trim() ? { instruction: instruction.trim() } : {}),
      }),
    },
  )
  return result.creation
}
