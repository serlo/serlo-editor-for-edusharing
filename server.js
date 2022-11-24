const { loadEnvConfig } = require('@next/env')
const express = require('express')
const jwt = require('jsonwebtoken')
const { Provider } = require('ltijs')
const next = require('next')
const fetch = require('node-fetch')
const { Request } = require('node-fetch')
const { Blob } = require('buffer')
const { FormData, File } = require('formdata-node')
const { Readable } = require('stream')
const { FormDataEncoder } = require('form-data-encoder')
const JSONWebKey = require('json-web-key')
const { Buffer } = require('buffer')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

loadEnvConfig('./', process.env.NODE_ENV !== 'production')

Provider.setup(
  process.env.PLATFORM_SECRET, //
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

  const response = await fetch('http://localhost:3000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mayEdit:
        custom !== undefined && typeof custom.postContentApiUrl === 'string',
      ltik: res.locals.ltik,
      user: custom.user
    }),
  })
  res.send(await response.text())
})

void (async () => {
  await app.prepare()
  await Provider.deploy({ serverless: true })

  const server = express()

  server.use('/lti', Provider.app)

  server.get('/lti/get-embed-html', async (req, res) => {
    const nodeId = req.query["nodeId"]
    const { token } = res.locals

    const jwtBody = {
      aud: process.env.EDITOR_CLIENT_ID,
      "https://purl.imsglobal.org/spec/lti/claim/deployment_id" : process.env.EDITOR_DEPLOYMENT_ID,
      expiresIn: 60,
      dataToken: token.platformContext.custom.dataToken
    }

    // TODO: Duplicate code
    const privateKey = Buffer.from(
      process.env.EDITOR_PLATFORM_PRIVATE_KEY,
      'base64'
    ).toString('utf-8')

    const message = jwt.sign(jwtBody, privateKey, {
      algorithm: 'RS256',
      expiresIn: 60,
      keyid: process.env.EDITOR_KEY_ID,
    })

    const url = new URL(process.env.EDITOR_EDUSHARING_DETAILS_URL + nodeId)

    url.searchParams.append("displayMode", "inline")
    url.searchParams.append("jwt", encodeURIComponent(message))

    if (process.env.EDUSHARING_NETWORK_HOST) {
      url.host = process.env.EDUSHARING_NETWORK_HOST
    }

    const response = await fetch(url.href, { method: "GET", headers: {
      "Accept": "application/json"}
    })

    // TODO: Error handling
    res.json(await response.json())
  })

  // TODO: Use another library
  server.use('/platform/keys', async (_req, res) => {
    res
      .json({
        keys: [
          {
            kid: process.env.EDITOR_KEY_ID,
            alg: 'RS256',
            use: 'sig',
            ...JSONWebKey.fromPEM(
              Buffer.from(
                process.env.EDITOR_PLATFORM_PUBLIC_KEY,
                'base64'
              ).toString('utf-8')
            ).toJSON(),
          },
        ],
      })
      .end()
  })

  server.get('/lti/get-content', async (req, res) => {
    const { token } = res.locals

    const platform = await Provider.getPlatformById(token.platformId)

    const { appId, nodeId, user, getContentApiUrl, version, dataToken } =
      token.platformContext.custom
    const jwtBody = {
      appId,
      nodeId,
      user,
      ...(version != null ? { version } : {}),
      dataToken
    }
    const message = jwt.sign(jwtBody, await platform.platformPrivateKey(), {
      algorithm: 'RS256',
      expiresIn: 60,
      keyid: await platform.platformKid(),
    })
    const url = new URL(getContentApiUrl)
    // TODO: Use a method here
    if (process.env.EDUSHARING_NETWORK_HOST) {
      url.host = process.env.EDUSHARING_NETWORK_HOST
    }
    url.searchParams.append('jwt', message)

    const response = await fetch(url)

    return res.status(response.status).send(await response.text())
  })

  server.post('/lti/save-content', async (req, res) => {
    const { token } = res.locals

    const platform = await Provider.getPlatformById(token.platformId)

    const { appId, nodeId, user, postContentApiUrl, dataToken } =
      token.platformContext.custom
    const jwtBody = {
      appId,
      nodeId,
      user,
      dataToken
    }
    const message = jwt.sign(jwtBody, await platform.platformPrivateKey(), {
      algorithm: 'RS256',
      expiresIn: 60,
      keyid: await platform.platformKid(),
    })

    const url = new URL(postContentApiUrl)
    // TODO: Use a method here
    if (process.env.EDUSHARING_NETWORK_HOST) {
      url.host = process.env.EDUSHARING_NETWORK_HOST
    }
    url.searchParams.append('jwt', message)
    url.searchParams.append('mimetype', 'application/json')

    const comment = req.query['comment']
    if (comment && typeof comment === 'string') {
      url.searchParams.append('versionComment', comment)
    }

    const blob = new File([req.body], 'test.json')

    const data = new FormData()
    data.set('file', blob)

    const encoder = new FormDataEncoder(data)

    const request = new Request(url, {
      method: 'POST',
      headers: encoder.headers,
      body: Readable.from(encoder.encode()),
    })

    const response = await fetch(request)

    return res.status(response.status).send(await response.text())
  })

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })

  await Provider.registerPlatform({
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
