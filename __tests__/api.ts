export {}

describe('Editor tests', () => {
    const port = parseInt(process.env.PORT, 10) || 3000
    const url = `http://localhost:${port}`

    test('/platform/keys', async () => {
        const result = await fetch(`${url}/platform/keys`)
        console.log(result)
        
        expect(result).toBeDefined()
    })

    // test('/lti/keys', () => {
    //     expect(true).toBeDefined()
    // })

    // test('Open editor with LTI', () => {
    //     expect(true).toBeDefined()
    // })

    // test('Open editor in view mode when postContentApiUrl is not present ', () => {
    //     expect(true).toBeDefined()
    // })

    // test('Button "Close and Save"', () => {
    //     expect(true).toBeDefined()
    // })

    // test('Button "name version"', () => {
    //     expect(true).toBeDefined()
    // })

    // test('Content is saved after 5 secs', () => {
    //     expect(true).toBeDefined()
    // })

    // test('Content is saved when closed with a tab', () => {
    //     expect(true).toBeDefined()
    // })

    // test('Calls for LTI lke keyset URLs', () => {
    //     expect(true).toBeDefined()
    // })

    // test('Deeplink-Call?!', () => {
    //     expect(true).toBeDefined()
    // })
})