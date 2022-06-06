const express = require('express')
const { Provider } = require('ltijs')
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

Provider.setup(
  'LTIKEY', // Key used to sign cookies and tokens
  {
    // Database configuration
    // TODO: use postgres instead?
    url: 'mongodb://localhost/admin',
    connection: { user: 'root', pass: 'example' },
  },
  {
    // Options
    cookies: {
      secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: '', // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: true, // Set DevMode to false if running in a production environment with https
  }
)

Provider.onConnect((token, req, res) => {
  console.log(token)
  return res.send("It's alive!")
})

void (async () => {
  await app.prepare()
  await Provider.deploy({ serverless: true })

  const server = express()

  server.use('/lti', Provider.app)

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })

  // TODO: Docker env variables? Or dynamic registration flow?
  Provider.registerPlatform({
    url: 'http://localhost:8000',
    name: 'Moodle',
    clientId: 'yPv7JvU5UcfBXTr',
    authenticationEndpoint: 'http://localhost:8000/mod/lti/auth.php',
    accesstokenEndpoint: 'http://localhost:8000/mod/lti/token.php',
    authConfig: {
      method: 'JWK_SET',
      key: 'http://localhost:8000/mod/lti/certs.php',
    },
  })
})()
