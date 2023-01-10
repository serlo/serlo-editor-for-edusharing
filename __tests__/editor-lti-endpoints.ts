import fetch from 'node-fetch'

describe('All requests to editor endpoints /lti/... shall return Unauthorized (401) if url parameter "ltik" is missing or invalid.', () => {
  const baseUrl = 'http://localhost:3000'

  // Shall contain all endpoints under /lti/... because all those need a valid ltik url parameter.
  const endpointsToTest = [
    '/lti/',
    '/lti/save-content',
    '/lti/start-edusharing-deeplink-flow',
    '/lti/get-embed-html',
    '/lti/get-content',
  ]

  const fetchAndExpectErrorResponse = async (url) => {
    const response = await fetch(url)
    expect(response.status).toBe(401)
    expect(await response.json()).toMatchObject({
      error: 'Unauthorized',
      status: 401,
    })
  }

  test.each(endpointsToTest)('Endpoint %s', (endpoint) => {
    fetchAndExpectErrorResponse(`${baseUrl}${endpoint}`)
    fetchAndExpectErrorResponse(`${baseUrl}${endpoint}?ltik=foo`)
  })
})
