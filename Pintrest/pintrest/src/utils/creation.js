export function timestampToDate(value) {
  if (!value) return null
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof value.toDate === 'function') return value.toDate()
  if (typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000 + (value.nanoseconds || 0) / 1000000)
  }
  if (typeof value._seconds === 'number') {
    return new Date(value._seconds * 1000 + (value._nanoseconds || 0) / 1000000)
  }
  return null
}

export function formatCreationDate(value) {
  const date = timestampToDate(value)
  if (!date) return 'Date unavailable'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatCreationDateTime(value) {
  const date = timestampToDate(value)
  if (!date) return 'Date unavailable'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function getCreationSourceLabel(creation) {
  if (creation.media?.sourceImage) return 'Source image ready'
  if (creation.sourceImageUrl) return 'Linked source image'
  return 'No source image yet'
}
