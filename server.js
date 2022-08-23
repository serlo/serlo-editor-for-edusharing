const { loadEnvConfig } = require('@next/env')
const express = require('express')
const { Provider } = require('ltijs')
const next = require('next')
const fetch = require('node-fetch')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

loadEnvConfig('./', process.env.NODE_ENV !== 'production')

Provider.setup(
  process.env.PROVIDER_SECRET, // Key used to sign cookies and tokens
  {
    url: process.env.MONGODB_URL,
    connection: {
      user: process.env.MONGODB_USERNAME,
      pass: process.env.MONGODB_PASSWORD,
    },
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
  const { custom } = res.locals.context
  const state = JSON.parse(custom.state)

  // TODO: get url from somewhere
  const response = await fetch('http://localhost:3000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mayEdit: custom.mayEdit === 'true',
      saveUrl: custom.saveUrl,
      savePayload: custom.saveUrl,
      ltik: res.locals.ltik,
      state,
    }),
  })
  res.send(await response.text())
})

Provider.onDeepLinking(async (token, req, res) => {
  // TODO: get url from somewhere
  const response = await fetch('http://localhost:3000/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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
      [
        {
          type: 'ltiResourceLink',
          title: 'TITLE',
          url: 'http://localhost:3000/lti',
          custom: {
            state: req.body,
          },
        },
      ],
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

  Provider.registerPlatform({
    url: process.env.PLATFORM_URL,
    name: 'Platform',
    clientId: process.env.PLATFORM_CLIENT_ID,
    authenticationEndpoint: process.env.PLATFORM_AUTHENTICATION_ENDPOINT,
    accesstokenEndpoint: process.env.PLATFORM_ACCESSTOKEN_ENDPOINT,
    authConfig: {
      method: 'JWK_SET',
      key: process.env.PLATFORM_JWK_SET,
    },
  })
})()
