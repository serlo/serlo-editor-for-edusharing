import express from 'express'
import jwt from 'jsonwebtoken'
import { Provider } from 'ltijs'
import next from 'next'
import fetch from 'node-fetch'
import { Request } from 'node-fetch'
import { FormData, File } from 'formdata-node'
import { Readable } from 'stream'
import { FormDataEncoder } from 'form-data-encoder'
import JSONWebKey from 'json-web-key'
import { Buffer } from 'buffer'
import { createAutoFromResponse, loadEnvConfig } from './src/server-utils'

const port = parseInt(process.env.PORT, 10) || 3000
const isDevEnvironment = process.env.NODE_ENV !== 'production'
const app = next({ dev: isDevEnvironment })
const handle = app.getRequestHandler()

if (isDevEnvironment) loadEnvConfig()

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

Provider.onConnect(async (_token, _req, res) => {
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
    }),
  })
  res.send(await response.text())
})

const server = (async () => {
  await app.prepare()
  await Provider.deploy({ serverless: true })

  const server = express()

  server.use('/lti', Provider.app)

  server.use('/lti/start-edusharing-deeplink-flow', async (_req, res) => {
    const { user, dataToken, nodeId } = res.locals.token.platformContext.custom
    const messageHint: MessageHint = { user, dataToken, nodeId }

    if (dataToken == null) {
      res
        .status(500)
        .setHeader('Content-type', 'text/html')
        .send('<html><body><p>dataToken is not set</p></body></html>')
    } else {
      createAutoFromResponse({
        res,
        method: 'GET',
        targetUrl: process.env.EDITOR_LOGIN_INITIATION_URL,
        params: {
          iss: process.env.EDITOR_URL,
          target_link_uri: process.env.EDITOR_TARGET_DEEP_LINK_URL,
          login_hint: process.env.EDITOR_CLIENT_ID,
          lti_message_hint: JSON.stringify(messageHint),
          client_id: process.env.EDITOR_CLIENT_ID,
          lti_deployment_id: process.env.EDITOR_DEPLOYMENT_ID,
        },
      })
    }
  })

  server.get('/lti/get-embed-html', async (req, res) => {
    const nodeId = req.query['nodeId']
    const repositoryId = req.query['repositoryId']
    const { token } = res.locals

    const jwtBody = {
      aud: process.env.EDITOR_CLIENT_ID,
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id':
        process.env.EDITOR_DEPLOYMENT_ID,
      expiresIn: 60,
      dataToken: token.platformContext.custom.dataToken,
      'https://purl.imsglobal.org/spec/lti/claim/context': {
        id: process.env.EDITOR_CLIENT_ID,
      },
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

    const url = new URL(
      process.env.EDITOR_EDUSHARING_DETAILS_URL + repositoryId + '/' + nodeId
    )

    url.searchParams.append('displayMode', 'inline')
    url.searchParams.append('jwt', encodeURIComponent(message))

    if (process.env.EDUSHARING_NETWORK_HOST) {
      url.host = process.env.EDUSHARING_NETWORK_HOST
    }

    const response = await fetch(url.href, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (response.status != 200) {
      console.error('Status-Code', response.status)
      console.error(await response.text())

      res.json({ details: '<b>ERROR!</b>' })
    } else {
      // TODO: Error handling
      res.json(await response.json())
    }
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

  server.get('/platform/login', async (req, res) => {
    const nonce = req.query['nonce']
    const state = req.query['state']

    if (typeof nonce !== 'string') {
      res.status(400).send('nonce is not valid').end()
      return
    } else if (typeof state !== 'string') {
      res.status(400).send('state is not valid').end()
      return
    } else if (
      req.query['redirect_uri'] !== process.env.EDITOR_TARGET_DEEP_LINK_URL
    ) {
      res.status(400).send('redirect_uri is not valid').end()
      return
    } else if (req.query['client_id'] !== process.env.PLATFORM_CLIENT_ID) {
      res.status(400).send('client_id is not valid').end()
      return
    }

    // TODO: Proper parsing
    const messageHintParam = req.query['lti_message_hint'] as string
    const { user, dataToken, nodeId } = JSON.parse(
      messageHintParam
    ) as MessageHint

    // See https://www.imsglobal.org/spec/lti-dl/v2p0#deep-linking-request-example
    // for an example of a deep linking requst payload
    const payload = {
      iss: process.env.EDITOR_URL,
      // TODO: Should be a list
      aud: process.env.EDITOR_CLIENT_ID,
      sub: user,

      iat: Date.now(),
      nonce,
      dataToken,

      'https://purl.imsglobal.org/spec/lti/claim/deployment_id':
        process.env.EDITOR_DEPLOYMENT_ID,
      'https://purl.imsglobal.org/spec/lti/claim/message_type':
        'LtiDeepLinkingRequest',
      'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
      'https://purl.imsglobal.org/spec/lti/claim/roles': [],
      'https://purl.imsglobal.org/spec/lti/claim/context': { id: nodeId },
      'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings': {
        accept_types: ['ltiResourceLink'],
        accept_presentation_document_targets: ['iframe'],
        accept_multiple: true,
        auto_create: false,
        deep_link_return_url: `${process.env.EDITOR_URL}platform/done`,
        title: '',
        text: '',
      },
    }

    const privateKey = Buffer.from(
      process.env.EDITOR_PLATFORM_PRIVATE_KEY,
      'base64'
    ).toString('utf-8')

    const token = jwt.sign(payload, privateKey, {
      algorithm: 'RS256',
      expiresIn: 60,
      keyid: process.env.EDITOR_KEY_ID,
    })

    createAutoFromResponse({
      res,
      method: 'POST',
      targetUrl: process.env.EDITOR_TARGET_DEEP_LINK_URL,
      params: { id_token: token, state },
    })
  })

  server.get('/lti/get-content', async (_req, res) => {
    const { token } = res.locals

    const platform = await Provider.getPlatformById(token.platformId)

    const { appId, nodeId, user, getContentApiUrl, version, dataToken } =
      token.platformContext.custom
    const jwtBody = {
      appId,
      nodeId,
      user,
      ...(version != null ? { version } : {}),
      dataToken: dataToken ?? 'foo',
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

    const response = await fetch(url.href)

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
      dataToken,
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

    const request = new Request(url.href, {
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

interface MessageHint {
  user: string
  dataToken: string
  nodeId: string
}

export default server
