import jwt from 'jsonwebtoken'
import { Server } from 'node:http'
import { expect, test, describe } from '@jest/globals'
import express, { RequestHandler } from 'express'
import { MongoClient, Collection } from 'mongodb'

import { createJWKSResponse } from '../src/server-utils'

let deeplinkNonces: Collection
let deeplinkLoginData: Collection
let mongoClient: MongoClient

beforeAll(async () => {
  // TODO: It would be better to test the requests to /platform/login and
  // /platform/done by making the appropriate requests to /lti/start-deeplink-flow
  // first since this better tests the features which are seen by users
  const mongoUrl = new URL(process.env.MONGODB_URL)
  mongoUrl.username = encodeURI(process.env.MONGODB_USERNAME)
  mongoUrl.password = encodeURI(process.env.MONGODB_PASSWORD)
  mongoClient = new MongoClient(mongoUrl.href)

  await mongoClient.connect()
  deeplinkNonces = mongoClient.db().collection('deeplink_nonces')
  deeplinkLoginData = mongoClient.db().collection('deeplink_login_data')
})

afterAll(async () => {
  await mongoClient.close()
})

describe('endpoint "/platform/login"', () => {
  const parameters = [
    'nonce',
    'state',
    'login_hint',
    'client_id',
    'redirect_uri',
  ] as const
  let validLoginHint: string
  let searchParams: Record<(typeof parameters)[number], string>

  beforeEach(async () => {
    const loginData = deeplinkLoginData.insertOne({
      createdAt: new Date(),
      user: 'admin',
      nodeId: 'foo',
      dataToken: 'bar',
    })
    validLoginHint = (await loginData).insertedId.toString()

    searchParams = {
      nonce: 'bar',
      state: 'foo',
      login_hint: validLoginHint,
      client_id: process.env.EDITOR_CLIENT_ID_FOR_EMBEDDING as string, // TODO This should be the client_id of edu-sharing, not the editor.
      redirect_uri: process.env
        .EDUSHARING_AUTHENTICATION_RESPONSE_URL_FOR_EMBEDDING as string,
    }
  })

  describe('fails when a needed parameter is not set', () => {
    test.each(parameters)('when %s is not set', async (param) => {
      delete searchParams[param]
      const response = await fetchLogin(searchParams)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe(`${param} is not valid`)
    })
  })

  test('fails when login_hint is not an object id', async () => {
    const response = await fetchLogin({ ...searchParams, login_hint: 'foo' })

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('login_hint is not valid')
  })

  test('fails when no session for login_hint could be found in the database', async () => {
    const invalidSession = (
      await deeplinkLoginData.insertOne({ createdAt: Date() })
    ).insertedId.toString()

    const response = await fetchLogin({
      ...searchParams,
      login_hint: invalidSession,
    })

    expect(response.status).toBe(400)
    expect(await response.text()).toBe(
      'login_hint is invalid or session is expired'
    )
  })

  test('succeeds when proper arguments are given', async () => {
    const response = await fetchLogin(searchParams)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe(
      'text/html; charset=utf-8'
    )
  })

  function fetchLogin(params: Partial<typeof searchParams>) {
    const url = new URL('http://localhost:3000/platform/login')

    for (const [name, value] of Object.entries(params)) {
      url.searchParams.append(name, value)
    }

    return fetch(url.href)
  }
})

describe('endpoint "/platform/done"', () => {
  const validKeyid = 'keyid'
  const validKey = Buffer.from(
    process.env.EDITOR_PRIVATE_KEY_FOR_EMBEDDING,
    'base64'
  ).toString('utf-8')
  const iat = Math.floor(Date.now() / 1000)
  const validNonceValue = 'nonce-value'
  const validPayloadWithDataClaim = {
    iss: 'editor',
    aud: 'http://localhost:3000/',
    iat,
    exp: iat + 100,
    nonce: validNonceValue,
    azp: 'http://localhost:3000/',
    'https://purl.imsglobal.org/spec/lti/claim/deployment_id': '2',
    'https://purl.imsglobal.org/spec/lti/claim/message_type':
      'LtiDeepLinkingResponse',
    'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
    'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': [
      {
        custom: {
          repositoryId: 'serlo-edusharing',
          nodeId: '960c48d0-5e01-45ca-aaf6-d648269f0db2',
        },
        icon: {
          width: 'null',
          url: 'http://repository.127.0.0.1.nip.io:8100/edu-sharing/themes/default/images/common/mime-types/svg/file-image.svg',
          height: 'null',
        },
        type: 'ltiResourceLink',
        title: '2020-11-13-152700_392x305_scrot.png',
        url: 'http://repository.127.0.0.1.nip.io:8100/edu-sharing/rest/lti/v13/lti13/960c48d0-5e01-45ca-aaf6-d648269f0db2',
      },
    ],
  }

  test('fails when "content-type" is not "application/x-www-form-urlencoded"', async () => {
    const response = await fetchDone()

    expect(response.status).toBe(400)
    expect(await response.text()).toBe(
      '"content-type" is not "application/x-www-form-urlencoded"'
    )
  })

  test('fails when no JWT token as parameter "JWT" is present in the body', async () => {
    const response = await fetchDoneWithJWTValue({ JWT: undefined })

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('JWT token is missing in the request')
  })

  test('fails when a malformed JWT is send', async () => {
    const response = await fetchDoneWithJWTValue({ JWT: 'foobar' })

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('jwt malformed')
  })

  test('fails when no keyid is present in the JWT', async () => {
    const response = await fetchDoneWithJWT({ keyid: undefined })

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('No keyid was provided in the JWT')
  })

  test('fails when keysetUrl cannot be fetched', async () => {
    const response = await fetchDoneWithJWT({ keyid: validKeyid })

    expect(response.status).toBe(502)
    expect(await response.text()).toBe(
      'An error occured while fetching key from the keyset URL'
    )
  })

  describe('when editor can connect to keyset URL of edu-sharing', () => {
    let dataClaim: string
    let keysetRequestHandler: RequestHandler
    let server: Server

    beforeAll((done) => {
      const app = express()

      app.get('/edu-sharing/rest/lti/v13/jwks', (req, res, next) => {
        keysetRequestHandler(req, res, next)
      })

      server = app.listen(8100, done)
    })

    beforeEach(async () => {
      keysetRequestHandler = (_req, res) => {
        createJWKSResponse({
          res,
          keyid: validKeyid,
          key: process.env.EDITOR_PUBLIC_KEY_FOR_EMBEDDING,
        })
      }
      const nonceData = await deeplinkNonces.insertOne({
        createdAt: new Date(),
        nonce: validNonceValue,
      })
      dataClaim = nonceData.insertedId.toString()
    })

    afterAll((done) => {
      server.close(done)
    })

    test('fails when edu-sharing has an internal server error', async () => {
      keysetRequestHandler = (_req, res) => res.sendStatus(500)

      const response = await fetchDoneWithJWT({ keyid: validKeyid })

      expect(response.status).toBe(502)
      expect(await response.text()).toBe(
        'An error occured while fetching key from the keyset URL'
      )
    })

    test('fails when edu-sharing responses with text response', async () => {
      keysetRequestHandler = (_req, res) => res.send('no json response')

      const response = await fetchDoneWithJWT({ keyid: validKeyid })

      expect(response.status).toBe(502)
      expect(await response.text()).toBe(
        'An error occured while fetching key from the keyset URL'
      )
    })

    test('fails when edu-sharing responses with malformed keyset', async () => {
      keysetRequestHandler = (_req, res) => res.json('malformed')

      const response = await fetchDoneWithJWT({ keyid: validKeyid })

      expect(response.status).toBe(502)
      expect(await response.text()).toBe(
        'An error occured while fetching key from the keyset URL'
      )
    })

    test('fails when the keyset of edu-sharing is empty', async () => {
      keysetRequestHandler = (_req, res) => res.json([])

      const response = await fetchDoneWithJWT({ keyid: validKeyid })

      expect(response.status).toBe(502)
      expect(await response.text()).toBe(
        'An error occured while fetching key from the keyset URL'
      )
    })

    test('fails when the given keyid in the JWT cannot be found in the keyset', async () => {
      const response = await fetchDoneWithJWT({ keyid: 'invalid-key' })

      expect(response.status).toBe(502)
      expect(await response.text()).toBe(
        'An error occured while fetching key from the keyset URL'
      )
    })

    test('fails when the JWT is expired', async () => {
      const response = await fetchDoneWithJWT({
        keyid: validKeyid,
        payload: { ...validPayloadWithDataClaim, exp: iat - 10 },
      })

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('jwt expired')
    })

    test('fails when "iss" is invalid', async () => {
      const response = await fetchDoneWithJWT({
        keyid: validKeyid,
        payload: { ...validPayloadWithDataClaim, iss: 'foo' },
      })

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('jwt issuer invalid. expected: editor')
    })

    test('fails when "aud" is invalid', async () => {
      const response = await fetchDoneWithJWT({
        keyid: validKeyid,
        payload: { ...validPayloadWithDataClaim, aud: 'foo' },
      })

      expect(response.status).toBe(400)
      expect(await response.text()).toBe(
        'jwt audience invalid. expected: http://localhost:3000/'
      )
    })

    test('fails when no data claim is send is invalid', async () => {
      const response = await fetchDoneWithJWT({
        keyid: validKeyid,
        payload: validPayloadWithDataClaim,
      })

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('data claim in JWT is missing')
    })

    test('fails when invalid data claim is send', async () => {
      const response = await fetchDoneWithJWT({
        keyid: validKeyid,
        payload: validPayloadWithDataClaim,
        dataClaim: 'foo',
      })

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('data claim in JWT is invalid')
    })

    test('fails when stored session is invalid', async () => {
      const nonceData = await deeplinkNonces.insertOne({
        createdAt: new Date(),
      })
      dataClaim = nonceData.insertedId.toString()

      const response = await fetchDoneWithJWT({
        keyid: validKeyid,
        payload: validPayloadWithDataClaim,
        dataClaim,
      })

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('deeplink flow session expired')
    })

    test('fails when "nonce" is invalid', async () => {
      const response = await fetchDoneWithJWT({
        keyid: validKeyid,
        payload: { ...validPayloadWithDataClaim, nonce: 'foo' },
        dataClaim,
      })

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('nonce is invalid')
    })

    test('fails when "custom" claim is malformed', async () => {
      const response = await fetchDoneWithJWT({
        keyid: validKeyid,
        payload: {
          ...validPayloadWithDataClaim,
          'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': {
            custom: 1,
          },
        },
        dataClaim,
      })

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('malformed custom claim in JWT send')
    })

    test('fails when "jwt" is signed by another key', async () => {
      const invalidKey = `
        -----BEGIN RSA PRIVATE KEY-----
        MIIEpAIBAAKCAQEAplp60im+W3yZ6JAjJaZe42o9Ef5TkiGxVkKbUuTWCUV60Hf2
        0CmV/OcAPJoqBtQkPCLIsempMHbqFNbQpEZWKHEdITA00PXnVMa62vD1EM7Kn8iX
        cy544r2cb1+W5PdtTTrnadLDvg2WHxtI3NqFJyZO1TdH8epCrSiI7CT/URnFFlSC
        lQd1Ho0NxFbhaMaOyGBqkaYyG49Q5UVFRy+AFbSQU87XHscg5XDGWHqsWqxqHMFX
        JCVoxPuvpU9I9RmL+j4iTwg22FduEjAqkI5pl6lllFPmvr4hIkbQgFic0ixoVD37
        SMFHJU2oEaVIcq6LwNw1a0B3tTpJGDRWzmsGYQIDAQABAoIBABqFMi9vGDndk2vQ
        Dsphy57VwQatVQVm+a6Wz8xXTwgLW5kAhwiImLDI4vDGYwzTpTMxGG3EooRncMoB
        tSF7VSD9Z3dzB/iIO2j4hbGB2I/lZ8gxYnOqZPtA3z+iLZwzFenKCjqEr1ANOnGb
        F/Kdo7yqDsdPGNkoT5jrbWi4PTvgbOCN4vPc0QQAXJtv/wY3fvzbQuCjqp2Bn0qV
        pXcxtatKlFWisRyYiYiCb+RQM9S/C5XvB/4/K8hNpK7IDc+bW6sCSwgn+P14ZuUz
        rCQew+8qqAZuS0A4QmjXt891V/fSQKiU5qRLJDrtFHNhurKegF/DubAI1dwmvzo7
        aSip5wECgYEA+VM7md7S4TDJ0YUmumAgvFgwmzpLAi8SmnwFPJQBy5htUfWV3sxI
        hB2gzLbT6Wd4PPEBsYy+ARELKvbFp9+9zrmITlWhHq9Y1Zt8B9io33vlHVzSxURU
        iXlHFOSrT/H6jWHnd0XESIdyC7Z3zVhU3pTOaoOFvUYw2vg5HN5s5N0CgYEAqs6Y
        PCw2z3+RCitHBrwKcqyzinF2WqCGMyv4rpvfX+IGkRUhrK0173mA+Eo5k2RulPBK
        eoi5GFQNNfhSCyM/PII6+PYxW3UD+iO5l1q3eU0yqQXz9NKI5BSPmCYiurcsKLJM
        u9j/I1HFR6o3uIvQyEPeH+KSNDwnuvCtIL9OHVUCgYEAi/sSHGrBJROaS9shCkTM
        PFKbP5uz308Ed92npwJGG8PBpOFoOoWhNSPZUvZW9dVU6Yo6dC/bwYeLKJ0SDhWN
        YJJEGA71fd/e1VcNhO48qfTKhvjFkWGywNhpcy6LjEAEdvp/1TRDZqE9A5x3mL++
        LpWHar/bB5Bv/5CbqDytELUCgYBHmXKXRrFzKbZS3PFZEVoP1/UrA4TpWIDo0nXc
        O9rXBphaGNGU4MbLK9O0QOkBsAfqxw9xbf6pBBLFnOJHaO8JHk46LnliLRsNsAwM
        NirS3lluIOCyr85STYwj61iDjGUmahdgZwYMeCqKcAALjBBo4ooqM3+2BcFhy6HH
        KGpGQQKBgQDQDCkGrcnMscpzY4RZliDWkWiKgGmXmP3ycQJzg2ReYcLz4Q17YzZZ
        lAeIi6MzyKxKBTblHdzyJIBGQhtq2fjeoDXjYiLqYph0ml5TZoD2jHh6kTXAWKma
        L8ovrRvQ0MjWyIOrBeudSjU2rtOAHcgmoF3IOhjqk8/fcckvRoE4DA==
        -----END RSA PRIVATE KEY-----`
        .trim()
        .replace(/\n +/g, '\n')
      const response = await fetchDoneWithJWT({
        keyid: validKeyid,
        key: invalidKey,
      })

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('invalid signature')
    })

    test('succeeds when valid values are send', async () => {
      const response = await fetchDoneWithJWT({
        keyid: validKeyid,
        dataClaim,
      })

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe(
        'text/html; charset=utf-8'
      )
    })
  })

  function fetchDoneWithJWT(args: {
    keyid?: string | null
    key?: string
    payload?: jwt.JwtPayload
    dataClaim?: string
  }) {
    const { keyid, key, payload = validPayloadWithDataClaim } = args
    const { dataClaim } = args

    const jwtPayload = {
      ...payload,
      ...(dataClaim
        ? { 'https://purl.imsglobal.org/spec/lti-dl/claim/data': dataClaim }
        : {}),
    }

    const jwtValue = jwt.sign(jwtPayload, key ?? validKey, {
      algorithm: 'RS256',
      ...(keyid ? { keyid } : {}),
    })

    return fetchDoneWithJWTValue({ JWT: jwtValue })
  }

  function fetchDoneWithJWTValue(args: { JWT?: string }) {
    const { JWT } = args
    return fetchDone({
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      ...(JWT ? { body: new URLSearchParams({ JWT }) } : {}),
    })
  }

  function fetchDone(init?: RequestInit) {
    const url = 'http://localhost:3000/platform/done'
    return fetch(url, { method: 'POST', ...init })
  }
})
