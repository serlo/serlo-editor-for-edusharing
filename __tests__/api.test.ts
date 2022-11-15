import fetch from 'node-fetch'

describe('Editor tests', () => {
    const port = parseInt(process.env.PORT, 10) || 3000
    const url = `http://localhost:${port}`

    test('/platform/keys', async () => {
        const result = await fetch(`${url}/platform/keys`)
        console.log(result)
        
        expect(result).toBeDefined()
    })

    test.todo('/lti/keys', async () => {
        const result = await fetch(`${url}/platform/keys`)
        console.log(result)

        expect(result).toBeDefined()
    })

    test.todo('Calls for LTI lke keyset URLs', () => {
        
    })

    test.todo('Deeplink-Call?!', () => {
        
    })
})