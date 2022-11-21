import fetch from 'node-fetch'

describe('Calls for LTI request tests', () => {
  const port = parseInt(process.env.PORT, 10) || 3000
  const url = `http://localhost:${port}`

  test('/platform/keys', async () => {
    const response = await fetch(`${url}/platform/keys`)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
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
    })
  })

  test('/lti/keys', async () => {
    const response = await fetch(`${url}/lti/keys`)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
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
    })
  })
})
