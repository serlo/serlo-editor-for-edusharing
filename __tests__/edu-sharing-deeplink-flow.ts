import fetch from 'node-fetch'

describe('endpoint "/lti/start-edusharing-deeplink-flow"', () => {
  describe('fails, when no or an invalid ltik is send', () => {
    test.each([
      'http://localhost:3000/lti/start-edusharing-deeplink-flow',
      'http://localhost:3000/lti/start-edusharing-deeplink-flow?ltik=foo',
    ])('url = %s', async (url) => {
      const response = await fetch(url)

      expect(response.status).toBe(401)
      expect(await response.json()).toMatchObject({
        error: 'Unauthorized',
        status: 401,
      })
    })
  })
})
