import fetch from 'node-fetch'
import { expect } from '@jest/globals'

describe('endpoint "/platform/login"', () => {
  const correctParamaters = {
    nonce: 'bar',
    state: 'foo',
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
