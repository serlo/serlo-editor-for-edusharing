import fetch, { RequestInit } from 'node-fetch'
import jwt from 'jsonwebtoken'
import { Server } from 'node:http'
import { expect, test, describe } from '@jest/globals'
import express, { RequestHandler } from 'express'

import { createJWKSResponse } from '../src/server-utils'

describe('endpoint "/platform/login"', () => {
  const correctParamaters = {
    nonce: 'bar',
    state: 'foo',
    user: 'admin',
    nodeId: 'foo',
    dataToken: 'bar',
    client_id: process.env.PLATFORM_CLIENT_ID,
    redirect_uri: process.env.EDITOR_TARGET_DEEP_LINK_URL,
  }

  describe('fails when a needed parameter is not set', () => {
    test.each(Object.keys(correctParamaters))(
      'when %s is not set',
      async (param) => {
        const url = new URL('http://localhost:3000/platform/login')

        for (const [name, value] of Object.entries(correctParamaters)) {
          if (name !== param) url.searchParams.append(name, value)
        }

        const response = await fetch(url.href)

        expect(response.status).toBe(400)
        expect(await response.text()).toBe(`${param} is not valid`)
      }
    )
  })
})

describe('endpoint "/platform/done"', () => {
  const validKeyid = 'keyid'
  const validKey = Buffer.from(
    process.env.EDITOR_PLATFORM_PRIVATE_KEY,
    'base64'
  ).toString('utf-8')
  const iat = Math.floor(Date.now() / 1000)
  const validPayload = {
    iss: 'editor',
    aud: 'http://localhost:3000/',
    iat,
    exp: iat + 100,
    nonce: 'none-value',
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
    const response = await fetchDoneWithJWTValue(undefined)

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('JWT token is missing in the request')
  })

  test('fails when a malformed JWT is send', async () => {
    const response = await fetchDoneWithJWTValue('foobar')

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
    let keysetRequestHandler: RequestHandler
    let server: Server

    beforeAll((done) => {
      const app = express()

      app.get('/edu-sharing/rest/lti/v13/jwks', (req, res, next) => {
        keysetRequestHandler(req, res, next)
      })

      server = app.listen(8100, done)
    })

    beforeEach(() => {
      keysetRequestHandler = (_req, res) => {
        createJWKSResponse({
          res,
          keyid: validKeyid,
          key: process.env.EDITOR_PLATFORM_PUBLIC_KEY,
        })
      }
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
        payload: { ...validPayload, exp: iat - 10 },
      })

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('jwt expired')
    })

    test('fails when "iss" is invalid', async () => {
      const response = await fetchDoneWithJWT({
        keyid: validKeyid,
        payload: { ...validPayload, iss: 'foo' },
      })

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('jwt issuer invalid. expected: editor')
    })

    test('succeeds when valid values are send', async () => {
      const response = await fetchDoneWithJWT({ keyid: validKeyid })

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
  }) {
    const { keyid, key, payload = validPayload } = args

    const jwtValue = jwt.sign(payload, key ?? validKey, {
      algorithm: 'RS256',
      ...(keyid ? { keyid } : {}),
    })

    return fetchDoneWithJWTValue(jwtValue)
  }

  function fetchDoneWithJWTValue(JWT?: string) {
    return fetchDone({
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      ...(JWT ? { body: new URLSearchParams({ JWT }) } : {}),
    })
  }

  function fetchDone(init?: RequestInit) {
    const url = 'http://localhost:3000/platform/done'
    return fetch(url, { method: 'POST', ...init })
  }
})
