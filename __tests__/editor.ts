import fetch from 'node-fetch'
import jwt from 'jsonwebtoken'
import { expect, test, describe } from '@jest/globals'

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
  const validPayload = {
    iss: 'editor',
    aud: 'http://localhost:3000/',
    iat: Date.now(),
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

  test('fails when no keyid is present in the JWT', async () => {
    const JWT = jwt.sign(
      validPayload,
      Buffer.from(process.env.EDITOR_PLATFORM_PRIVATE_KEY, 'base64').toString(
        'utf-8'
      ),
      {
        algorithm: 'RS256',
        expiresIn: 60,
      }
    )

    const params = new URLSearchParams()
    params.append('JWT', JWT)

    const response = await fetch('http://localhost:3000/platform/done', {
      method: 'POST',
      body: params,
    })

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('No keyid was provided in the JWT')
  })
})
