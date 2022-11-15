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
      user: custom.user,
      dataToken: custom.dataToken
    }),
  })
  res.send(await response.text())
})

void (async () => {
  await app.prepare()
  await Provider.deploy({ serverless: true })

  const server = express()

  server.use('/lti', Provider.app)

  server.get('/get-embed-html', async (req, res) => {
    const nodeId = req.query["nodeId"]

    const dataToken = req.query["dataToken"]

    //@TODO aud and deployment_id from serlo platform config
    const jwtBody = {
      "aud" : "editor",
      "https://purl.imsglobal.org/spec/lti/claim/deployment_id" : "2",
      "dataToken" : dataToken
    }

    const { token } = res.locals

    //@TODO hard coded platformId
    var allPlatforms = await Provider.getAllPlatforms()
    var platform = null;
    for(const p of allPlatforms) {
      console.log(p.platformClientId())
      var platformClientId = await p.platformClientId();
      if(platformClientId === "editor"){
        platform = p;
      }
    }
    //const platform = await Provider.getPlatformById("d15b03fddf1953a8923cd29ad4851d88")

    const message = jwt.sign(jwtBody, await platform.platformPrivateKey(), {
      algorithm: 'RS256',
      expiresIn: 60,
      //this line causes on repo the following error java.lang.RuntimeException: no public key found for key: 6fa923b6e2ea88e6beb5c1341b809945
      keyid: await platform.platformKid(),
      //this line causes on repo "invalid key length" error 
      //keyid: "42",
    })

    const url = new URL(`http://repository.127.0.0.1.nip.io:8100/edu-sharing/rest/lti/v13/details/-home-/${nodeId}?displayMode=inline&jwt=${message}`)
    console.log("uRl:"+url)

    if (process.env.EDUSHARING_NETWORK_HOST) {
      url.host = process.env.EDUSHARING_NETWORK_HOST
    }

    const response = await fetch(url.href, {
      method: 'GET'
    })

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
    console.log("token.platformId:"+token.platformId)

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
