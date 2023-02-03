import fetch from 'node-fetch'
import { signJwtWithBase64Key } from '../src/server-utils'

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

describe('endpoint "/lti"', () => {
  let valideCookieValue: string
  let validState: string

  beforeEach(async () => {
    const response = await fetch('http://localhost:3000/lti/login', {
      method: 'POST',
      body: new URLSearchParams({
        target_link_uri: 'http://localhost:3000/lti',
        iss: process.env.PLATFORM_URL,
        login_hint: 'admin',
        lti_message_hint: 'd882efaa-1f84-4a0f-9bc9-4f74f19f7576',
        lti_deployment_id: '1',
        client_id: process.env.PLATFORM_CLIENT_ID,
      }),
      redirect: 'manual',
    })

    // Check that have a valid login request
    expect(response.status).toBe(302)

    valideCookieValue = response.headers.get('set-cookie').split(';')[0]
    validState = new URL(response.headers.get('location')).searchParams.get(
      'state'
    )
  })

  test('fails when wrong issuer is sent', async () => {
    const payload = {
      nonce: 'nonce-value',
      iss: 'wrong-issuer',
      aud: process.env.PLATFORM_CLIENT_ID,
      sub: 'admin',
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id': '1',
      'https://purl.imsglobal.org/spec/lti/claim/context': {
        id: 'd882efaa-1f84-4a0f-9bc9-4f74f19f7576',
        label: 'Home des Unternehmens',
      },
      given_name: 'Administrator',
      family_name: '',
      email: 'admin@alfresco.com',
      'https://purl.imsglobal.org/spec/lti/claim/tool_platform': {
        name: 'local',
        product_family_code: 'edu-sharing',
        guid: 'serlo-edusharing',
        description: 'local',
        version: '9999.14076175.9999',
      },
      'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
      'https://purl.imsglobal.org/spec/lti/claim/roles': [],
      'https://purl.imsglobal.org/spec/lti/claim/target_link_uri':
        'http://localhost:3000/lti',
      'https://purl.imsglobal.org/spec/lti/claim/resource_link': {
        id: '604f62c1-6463-4206-a571-8c57097a54ae',
        title: 'Hello worldd',
      },
      'https://purl.imsglobal.org/spec/lti/claim/launch_presentation': {
        document_target: 'window',
        return_url:
          'http://repository.127.0.0.1.nip.io:8100/edu-sharing/components/workspace?id=d882efaa-1f84-4a0f-9bc9-4f74f19f7576&mainnav=true&displayType=0',
        locale: 'de_DE',
      },
      'https://purl.imsglobal.org/spec/lti/claim/message_type':
        'LtiResourceLinkRequest',
      'https://purl.imsglobal.org/spec/lti/claim/custom': {
        getContentApiUrl:
          'http://repository.127.0.0.1.nip.io:8100/edu-sharing/rest/ltiplatform/v13/content',
        fileName: 'Hello worldd',
        getDetailsSnippetUrl:
          'http://repository.127.0.0.1.nip.io:8100/edu-sharing/rest/lti/v13/details',
        dataToken:
          'kOXGc6AbqYW7iHOl3b48Pj/ngudoLCZk+DJwYxAg9wTiKsN9TKRY13qU+6vNNMEV2Guya3NPWO+Ay8IJDtQWMKxnkku/3mc+n64TIgMjs2yY7wXMYcvoRK4C9iXXpydNWQCGreYU2BcnMwne/b5BngOvBjqqVCPLMGT/lmvylP//GCzM7V99h9fKVMrgY97qOdsB1O0Ti//E3odWU1dFUMu3NLPy3MdTHXdViQpyPFRpgnZ8kcywDl0bLYSKy0pUuJy0hBvlnGmFyKlcQ38HaR2CZ9wRxrNgRxxEzGd8J+T6YSNoD8OyB9Nyjbp0N3tog4XhEZ/UASIqLYBzk+ygOA==',
        postContentApiUrl:
          'http://repository.127.0.0.1.nip.io:8100/edu-sharing/rest/ltiplatform/v13/content',
        appId: 'qsa2DgKBJ2WgoJO1',
        nodeId: '604f62c1-6463-4206-a571-8c57097a54ae',
        user: 'admin',
      },
    }

    const response = await fetch('http://localhost:3000/lti', {
      method: 'POST',
      headers: { Cookie: valideCookieValue },
      body: new URLSearchParams({
        id_token: signJwtWithBase64Key({
          payload,
          keyid: 'key',
          key: process.env.EDITOR_PLATFORM_PRIVATE_KEY,
        }),
        state: validState,
      }),
      redirect: 'manual',
    })

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      status: 401,
      error: 'Unauthorized',
      details: {
        description: 'Error validating ltik or IdToken',
        message: 'ISS_CLAIM_DOES_NOT_MATCH',
      },
    })
  })
})
