import fetch from 'node-fetch'

type KeyResponse = { keys: Array<IKey> }
interface IKey {
    kid: string;
    alg: 'RS256';
    use: 'sig';
    kty: 'RSA';
    n: string;
    e: string;
}

describe('Calls for LTI request tests', () => {
    const port = parseInt(process.env.PORT, 10) || 3000
    const url = `http://localhost:${port}`

    test('/platform/keys', async () => {
        const response = await fetch(`${url}/platform/keys`)
        const json: KeyResponse = await response.json()
        
        expect(response.status).toBe(200)
        expect(json.keys.length).toBeGreaterThan(0)
        expect(json.keys[0].kid).toEqual('42')
        expect(json.keys[0].n.length).toBeGreaterThan(0)
    })

    test('/lti/keys', async () => {
        const response = await fetch(`${url}/lti/keys`)
        const json: KeyResponse = await response.json()

        expect(response.status).toBe(200)
        expect(json.keys.length).toBeGreaterThan(0)
        expect(json.keys[0].n.length).toBeGreaterThan(0)
        expect(json.keys[1].n.length).toBeGreaterThan(0)
    })
})