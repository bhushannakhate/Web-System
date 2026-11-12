import { apiRequest } from './api'

function getImageContentType(file) {
  if (file.type) return file.type
  const extension = file.name.toLowerCase().split('.').pop()
  return {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  }[extension]
}

export async function uploadSourceImage(file, user) {
  const contentType = getImageContentType(file)
  if (!contentType) {
    throw new Error('Choose a JPG, PNG, or WebP image.')
  }

  const { creation } = await apiRequest('/creations', user, {
    method: 'POST',
    body: JSON.stringify({ status: 'draft' }),
  })

  try {
    const { upload } = await apiRequest(
      `/creations/${creation.id}/media/sourceImage/uploads`,
      user,
      {
        method: 'POST',
        body: JSON.stringify({
          contentType,
          sizeBytes: file.size,
        }),
      },
    )

    let response
    try {
      response = await fetch(upload.uploadUrl, {
        method: upload.method,
        headers: upload.headers,
        body: file,
      })
    } catch {
      throw new Error('The image could not be uploaded to secure storage. Check your connection and retry.')
    }

    if (!response.ok) {
      throw new Error('Secure storage rejected the image upload. Please retry.')
    }

    const { media } = await apiRequest(
      `/creations/${creation.id}/media/uploads/${upload.uploadId}/complete`,
      user,
      { method: 'POST' },
    )
    return { creationId: creation.id, media }
  } catch (error) {
    try {
      await apiRequest(`/creations/${creation.id}`, user, {
        method: 'DELETE',
      })
    } catch {
      throw new Error(
        `${error.message} The temporary creation could not be cleaned up; contact support before retrying.`,
      )
    }
    throw error
  }
}

export async function deleteUploadedCreation(creationId, user) {
  await apiRequest(`/creations/${creationId}`, user, { method: 'DELETE' })
}
