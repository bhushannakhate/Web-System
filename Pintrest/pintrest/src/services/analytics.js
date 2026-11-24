import ReactGA from 'react-ga4'

export const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || ''

export function initializeAnalytics() {
  if (!GA4_MEASUREMENT_ID) return false

  ReactGA.initialize(GA4_MEASUREMENT_ID, {
    gtagOptions: { send_page_view: false },
  })
  return true
}

export function trackPageView(path) {
  if (!GA4_MEASUREMENT_ID) return
  ReactGA.send({ hitType: 'pageview', page: path })
}

export function trackAgentWorkflowStarted(includeAudio) {
  if (!GA4_MEASUREMENT_ID) return
  ReactGA.event('agent_workflow_started', {
    input_mode: includeAudio ? 'audio_or_combined' : 'written',
  })
}

function getGaValue(field) {
  return new Promise((resolve) => {
    let settled = false
    const timeout = window.setTimeout(() => {
      if (settled) return
      settled = true
      resolve('')
    }, 500)

    try {
      ReactGA.gtag('get', GA4_MEASUREMENT_ID, field, (value) => {
        if (settled) return
        settled = true
        window.clearTimeout(timeout)
        resolve(
          typeof value === 'string' || typeof value === 'number'
            ? String(value)
            : '',
        )
      })
    } catch {
      window.clearTimeout(timeout)
      resolve('')
    }
  })
}

export async function getGaRequestHeaders() {
  if (!GA4_MEASUREMENT_ID) return {}

  const [clientId, sessionId] = await Promise.all([
    getGaValue('client_id'),
    getGaValue('session_id'),
  ])
  return {
    ...(clientId ? { 'X-GA-Client-Id': clientId } : {}),
    ...(sessionId ? { 'X-GA-Session-Id': sessionId } : {}),
  }
}
