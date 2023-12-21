import { createJWKSResponse, signJwtWithBase64Key } from '../src/server-utils'
import express from 'express'
import { Server } from 'node:http'

// See: https://cvmcosta.me/ltijs/#/provider?id=request-authentication
describe('All requests to editor endpoints /lti/... shall return Unauthorized (401) if url parameter "ltik" is missing or invalid.', () => {
  // Shall contain all endpoints under /lti/... because all those need a valid ltik url parameter.
  const endpointsToTest = [
    'lti/',
    'lti/save-content',
    'lti/start-edusharing-deeplink-flow',
    'lti/get-embed-html',
    'lti/get-content',
  ]

  test.each(endpointsToTest)('Endpoint %s', (endpoint) => {
    fetchAndExpectErrorResponse(`${process.env.EDITOR_URL}${endpoint}`)
    fetchAndExpectErrorResponse(`${process.env.EDITOR_URL}${endpoint}?ltik=foo`)
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
    const response = await fetch(process.env.EDITOR_URL + 'lti/login', {
      method: 'POST',
      body: new URLSearchParams({
        target_link_uri: process.env.EDITOR_URL + 'lti',
        iss: 'wrong-issuer',
        login_hint: 'admin',
        lti_message_hint: 'd882efaa-1f84-4a0f-9bc9-4f74f19f7576',
        lti_deployment_id: '1',
        client_id: process.env.EDITOR_CLIENT_ID_FOR_LAUNCH,
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

// REFACTOR There is duplicated code for starting an express server to provide an endpoint to retrieve the keyset for jwt signature validation. Here and in __tests__/editor.ts. Maybe setup a Jest test environment and a separate test file for all tests that need a working test double for edusharing listening on port 8100. This would reduce code duplication, make sure these tests run in sequence and would allow other jest test files to run in parallel meanwhile. See: https://jestjs.io/docs/configuration#testenvironment-string
describe('endpoint "/lti"', () => {
  let validCookieValue: string
  let validState: string
  let nonceReceivedInLoginRequest: string
  const validKeyid = 'keyid'
  const defaultValuesForIdTokenPayload = {
    iss: process.env.EDUSHARING_URL,
    aud: process.env.EDITOR_CLIENT_ID_FOR_LAUNCH,
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
      process.env.EDITOR_URL + 'lti',
    'https://purl.imsglobal.org/spec/lti/claim/resource_link': {
      id: '604f62c1-6463-4206-a571-8c57097a54ae',
      title: 'Hello worldd',
    },
    'https://purl.imsglobal.org/spec/lti/claim/launch_presentation': {
      document_target: 'window',
      return_url:
        process.env.EDUSHARING_URL +
        '/components/workspace?id=d882efaa-1f84-4a0f-9bc9-4f74f19f7576&mainnav=true&displayType=0',
      locale: 'de_DE',
    },
    'https://purl.imsglobal.org/spec/lti/claim/message_type':
      'LtiResourceLinkRequest',
    'https://purl.imsglobal.org/spec/lti/claim/custom': {
      getContentApiUrl:
        process.env.EDUSHARING_URL + '/rest/ltiplatform/v13/content',
      fileName: 'Hello worldd',
      getDetailsSnippetUrl:
        process.env.EDUSHARING_URL + '/rest/lti/v13/details',
      dataToken:
        'kOXGc6AbqYW7iHOl3b48Pj/ngudoLCZk+DJwYxAg9wTiKsN9TKRY13qU+6vNNMEV2Guya3NPWO+Ay8IJDtQWMKxnkku/3mc+n64TIgMjs2yY7wXMYcvoRK4C9iXXpydNWQCGreYU2BcnMwne/b5BngOvBjqqVCPLMGT/lmvylP//GCzM7V99h9fKVMrgY97qOdsB1O0Ti//E3odWU1dFUMu3NLPy3MdTHXdViQpyPFRpgnZ8kcywDl0bLYSKy0pUuJy0hBvlnGmFyKlcQ38HaR2CZ9wRxrNgRxxEzGd8J+T6YSNoD8OyB9Nyjbp0N3tog4XhEZ/UASIqLYBzk+ygOA==',
      postContentApiUrl:
        process.env.EDUSHARING_URL + '/rest/ltiplatform/v13/content',
      appId: 'qsa2DgKBJ2WgoJO1',
      nodeId: '604f62c1-6463-4206-a571-8c57097a54ae',
      user: 'admin',
    },
  }
  const defaultKeysetRequestHandler = (_req, res) => {
    createJWKSResponse({
      res,
      keyid: validKeyid,
      key: process.env.EDITOR_PUBLIC_KEY_FOR_EMBEDDING,
    })
  }
  let keysetRequestHandler = defaultKeysetRequestHandler
  let server: Server

  beforeAll((done) => {
    const app = express()

    app.get('/edu-sharing/rest/lti/v13/jwks', (req, res, next) => {
      keysetRequestHandler(req, res)
    })

    server = app.listen(8100, done)
  })

  beforeEach(async () => {
    keysetRequestHandler = defaultKeysetRequestHandler

    const response = await fetch(process.env.EDITOR_URL + 'lti/login', {
      method: 'POST',
      body: new URLSearchParams({
        target_link_uri: process.env.EDITOR_URL + 'lti',
        iss: process.env.EDUSHARING_URL,
        login_hint: 'admin',
        lti_message_hint: 'd882efaa-1f84-4a0f-9bc9-4f74f19f7576',
        lti_deployment_id: '1',
        client_id: process.env.EDITOR_CLIENT_ID_FOR_LAUNCH,
      }),
      redirect: 'manual',
    })

    // Check that we have a valid login request
    expect(response.status).toBe(302)

    validCookieValue = response.headers.get('set-cookie').split(';')[0]
    validState = new URL(response.headers.get('location')).searchParams.get(
      'state',
    )
    nonceReceivedInLoginRequest = new URL(
      response.headers.get('location'),
    ).searchParams.get('nonce')
  })

  afterAll((done) => {
    server.close(done)
  })

  test('succeeds', async () => {
    const response = await sendRequestToLtiEndpoint({
      overwriteParameters: {},
    })

    expect(response.status).toBe(302)
  })

  test('fails when wrong issuer is sent', async () => {
    const response = await sendRequestToLtiEndpoint({
      overwriteParameters: {
        issuer: 'invalid-issuer',
      },
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

  test('fails when id_token expired', async () => {
    const response = await sendRequestToLtiEndpoint({
      overwriteParameters: {
        idTokenExpireAfterSeconds: 0,
      },
    })

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      status: 401,
      error: 'Unauthorized',
      details: {
        description: 'Error validating ltik or IdToken',
        message: 'jwt expired',
      },
    })
  })

  test('fails when no key id of requested public keys matches the one used to sign id_token', async () => {
    keysetRequestHandler = (_req, res) => {
      createJWKSResponse({
        res,
        keyid: 'invalid-key-id',
        key: process.env.EDITOR_PUBLIC_KEY_FOR_EMBEDDING,
      })
    }

    const response = await sendRequestToLtiEndpoint({
      overwriteParameters: {},
    })

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      status: 401,
      error: 'Unauthorized',
      details: {
        description: 'Error validating ltik or IdToken',
        message: 'KEY_NOT_FOUND',
      },
    })
  })

  test('fails when no public key could be retrieved', async () => {
    keysetRequestHandler = (_req, res) => {
      res.end()
    }

    const response = await sendRequestToLtiEndpoint({
      overwriteParameters: {},
    })

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      status: 401,
      error: 'Unauthorized',
      details: {
        description: 'Error validating ltik or IdToken',
        message: 'KEYSET_NOT_FOUND',
      },
    })
  })

  test('fails when audience does not match the client id of lti tool', async () => {
    const response = await sendRequestToLtiEndpoint({
      overwriteParameters: {
        audience: 'invalid-audience',
      },
    })

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({
      status: 401,
      error: 'Unauthorized',
      details: {
        description: 'Error validating ltik or IdToken',
        message: 'UNREGISTERED_PLATFORM',
      },
    })
  })

  type RequestParametersToOverwrite = {
    issuer?: string
    idTokenExpireAfterSeconds?: number
    nonce?: string
    audience?: string
  }
  async function sendRequestToLtiEndpoint(params: {
    overwriteParameters: RequestParametersToOverwrite
  }) {
    let payloadInIdToken = {
      ...defaultValuesForIdTokenPayload,
      nonce: nonceReceivedInLoginRequest,
    }

    if ('issuer' in params.overwriteParameters) {
      payloadInIdToken.iss = params.overwriteParameters.issuer
    }
    if (
      'nonce' in params.overwriteParameters &&
      params.overwriteParameters.nonce != null
    ) {
      payloadInIdToken.nonce = params.overwriteParameters.nonce
    }
    if ('audience' in params.overwriteParameters) {
      payloadInIdToken.aud = params.overwriteParameters.audience
    }

    return fetch(process.env.EDITOR_URL + 'lti', {
      method: 'POST',
      headers: { Cookie: validCookieValue },
      body: new URLSearchParams({
        id_token: signJwtWithBase64Key({
          payload: payloadInIdToken,
          keyid: validKeyid,
          key: process.env.EDITOR_PRIVATE_KEY_FOR_EMBEDDING,
          expireAfterSeconds:
            params.overwriteParameters.idTokenExpireAfterSeconds,
        }),
        state: validState,
      }),
      redirect: 'manual',
    })
  }
})
