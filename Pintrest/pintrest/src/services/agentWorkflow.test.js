import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  reviewCreation,
  runAgentWorkflow,
  saveCreationTranscript,
  transcribeCreationAudio,
  uploadCreationAudio,
} from './agentWorkflow'

const user = { getIdToken: vi.fn(async () => 'test-token') }

afterEach(() => {
  vi.restoreAllMocks()
})

describe('agent workflow API contracts', () => {
  it('uploads audio, requests transcription, and persists an edited transcript', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({
        upload: {
          uploadId: 'upload-id',
          uploadUrl: 'https://storage.test/upload',
          method: 'PUT',
          headers: { 'Content-Type': 'audio/webm' },
        },
      }), { status: 201 }))
      .mockResolvedValueOnce(new Response('', { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ media: {} }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        transcription: { text: 'Make the light warmer.', confidence: 0.92 },
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        transcription: { text: 'Make the light much warmer.', edited: true },
      }), { status: 200 }))

    const audio = new File(['voice'], 'voice.webm', { type: 'audio/webm' })
    await uploadCreationAudio('creation-id', audio, user)
    const transcription = await transcribeCreationAudio('creation-id', user)
    const edited = await saveCreationTranscript('creation-id', transcription.text + ' much', user)

    expect(fetchMock).toHaveBeenCalledTimes(5)
    expect(transcription.confidence).toBe(0.92)
    expect(edited.text).toContain('much warmer')
    expect(JSON.parse(fetchMock.mock.calls[3][1].body)).toEqual({})
    expect(JSON.parse(fetchMock.mock.calls[4][1].body)).toEqual({
      transcript: 'Make the light warmer. much',
    })
  })

  it('sends edited transcript and Gemini consent with the workflow request', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ creation: { id: 'creation-id' } }), { status: 200 }),
    )

    await runAgentWorkflow(
      'creation-id',
      'Make the room brighter.',
      user,
      true,
      'Make the room much brighter.',
      true,
    )

    const request = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(request).toEqual({
      instructions: 'Make the room brighter.',
      includeAudio: true,
      transcript: 'Make the room much brighter.',
      consentToGemini: true,
    })
  })

  it('sends an explicit approval or revision request to the review endpoint', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ creation: { reviewStatus: 'revision_requested' } }), { status: 200 }),
    )

    await reviewCreation('creation-id', 'request_revision', 'Make the room warmer.', user)

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      action: 'request_revision',
      instruction: 'Make the room warmer.',
    })
    expect(fetchMock.mock.calls[0][0]).toContain('/creations/creation-id/review')
  })
})
