import fetch from 'node-fetch'

describe('Calls for LTI request tests', () => {
  const url = process.env.EDITOR_URL

  test('/platform/keys', async () => {
    const expected = {
      keys: [
        {
          kid: '42',
          alg: 'RS256',
          use: 'sig',
          kty: 'RSA',
          n: '4sz6WSrEX2wP_Q1I8dR1Ng4OvlCsi1-iylDt6-QVGhEKkg4uUzBCuTPfKOOPfZ418H1y2vNxS3P8wpS7OkdtOW5x8p5HcmELaGxpPVO0aqNYVcbVLIIzKvj9r9QCixg44vkvmfGj5mT6JJYWJOLMOIXILlzKT2QhpIamxbGsufQQ36ut5pxmC93-AimAbRz9h30xOCIZtUy5SUVKnKJKx5_crJEDLIOan5CsVFGbqZ59B_E_KT8ikwT804zpiEa22R__zVH27fX-RuHobYXBCQMpSO8QwEDIbSNPJIGOLRC_WeQ5U8-uY4Tx7Rj5n9wrk5kE5iZDW3O1swGAwGM1tw',
          e: 'AQAB',
        },
      ],
    }

    const response = await fetch(`${url}/platform/keys`)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual(expected)
  })

  test('/lti/keys', async () => {
    const expected = {
      keys: [
        {
          kty: 'RSA',
          n: expect.any(String),
          e: 'AQAB',
          kid: expect.any(String),
          alg: 'RS256',
          use: 'sig',
        },
      ],
    }

    const response = await fetch(`${url}/lti/keys`)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual(expected)
  })
})
