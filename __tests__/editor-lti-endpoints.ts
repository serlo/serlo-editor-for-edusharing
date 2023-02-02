import fetch from 'node-fetch'

// See: https://cvmcosta.me/ltijs/#/provider?id=request-authentication
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

  test.each(endpointsToTest)('Endpoint %s', (endpoint) => {
    fetchAndExpectErrorResponse(`${baseUrl}${endpoint}`)
    fetchAndExpectErrorResponse(`${baseUrl}${endpoint}?ltik=foo`)
  })

  async function fetchAndExpectErrorResponse(url: string) {
    const response = await fetch(url)
    expect(response.status).toBe(401)
    expect(await response.json()).toMatchObject({
      error: 'Unauthorized',
      status: 401,
    })
  }
})

describe('endpoint "/lti/login"', () => {
  test('fails, when a wrong issuer is submitted', async () => {
    const response = await fetch('http://localhost:3000/lti/login', {
      method: 'POST',
      body: new URLSearchParams({
        target_link_uri: 'http://localhost:3000/lti',
        iss: 'wrong-issuer',
        login_hint: 'admin',
        lti_message_hint: 'd882efaa-1f84-4a0f-9bc9-4f74f19f7576',
        lti_deployment_id: '1',
        client_id: process.env.PLATFORM_CLIENT_ID,
      }),
      redirect: 'manual',
    })

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      status: 400,
      error: 'Bad Request',
      details: { message: 'UNREGISTERED_PLATFORM' },
    })
  })
})
