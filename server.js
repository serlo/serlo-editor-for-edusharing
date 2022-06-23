const express = require('express')
const { Provider } = require('ltijs')
const next = require('next')
const fetch = require('node-fetch')

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

Provider.onConnect(async (token, req, res) => {
  // TODO: get url from somewhere
  const response = await fetch('http://localhost:3000/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // TODO: state
      ltik: res.locals.ltik,
    }),
  })
  res.send(await response.text())
})

Provider.onDeepLinking(async (token, req, res) => {
  console.log('hey ho')
  // TODO: get url from somewhere
  const response = await fetch('http://localhost:3000/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // TODO: state
      ltik: res.locals.ltik,
    }),
  })
  res.send(await response.text())
})

void (async () => {
  await app.prepare()
  await Provider.deploy({ serverless: true })

  const server = express()

  server.use('/lti', Provider.app)

  server.post('/lti/save', async (req, res) => {
    const form = await Provider.DeepLinking.createDeepLinkingForm(
      res.locals.token,
      [],
      { message: 'Successfully registered resource!' }
    )
    return res.send(form)
  })

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
