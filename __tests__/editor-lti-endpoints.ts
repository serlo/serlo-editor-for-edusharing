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

  const testUrl = async (url) => {
    const response = await fetch(url)
    expect(response.status).toBe(401)
    expect(await response.json()).toMatchObject({
      error: 'Unauthorized',
      status: 401,
    })
  }

  endpointsToTest.forEach((endpoint) => {
    describe(`Endpoint ${endpoint}`, () => {
      test.each([`${baseUrl}${endpoint}`, `${baseUrl}${endpoint}?ltik=foo`])(
        'url = %s',
        testUrl
      )
    })
  })
})
