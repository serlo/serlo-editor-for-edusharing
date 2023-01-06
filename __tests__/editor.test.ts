import fetch from 'node-fetch'
import { expect } from '@jest/globals'

describe('endpoint "/platform/login"', () => {
  test('fails when nonce is not set', async () => {
    const response = await fetch('http://localhost:3000/platform/login')

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('nonce is not set')
  })
})
