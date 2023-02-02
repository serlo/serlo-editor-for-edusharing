import express from 'express'
import cookieParser from 'cookie-parser'
import { MongoClient, ObjectId } from 'mongodb'
import { Provider } from 'ltijs'
import next from 'next'
import { createServer } from 'net'
import fetch from 'node-fetch'
import { Request } from 'node-fetch'
import { FormData, File } from 'formdata-node'
import { Readable } from 'stream'
import { FormDataEncoder } from 'form-data-encoder'
import {
  createAutoFromResponse,
  loadEnvConfig,
  signJwtWithBase64Key,
  signJwt,
  createJWKSResponse,
  verifyJwt,
  sendCustomInvalidErrorMessage,
  createErrorHtml,
} from '../server-utils'
import {
  DeeplinkFlowDecoder,
  JwtDeepflowResponseDecoder,
  LtiMessageHintDecoder,
  LtiMessageHint,
  LtiCustomType,
} from '../shared/decoders'

const port = parseInt(process.env.PORT, 10) || 3000
const isDevEnvironment = process.env.NODE_ENV !== 'production'

if (isDevEnvironment && !(await isPortOpen(port))) {
  console.error(`ERROR: Cannot listen on port ${port}`)
  console.error(
    `Probably there is already a dev server running -> so we do not start another server`
  )
  process.exit(0)
}

const app = next({ dev: isDevEnvironment })
const nextJsRequestHandler = app.getRequestHandler()

if (isDevEnvironment) loadEnvConfig()

const deeplinkFlowMaxAge = 60

const mongoUrl = new URL(process.env.MONGODB_URL)
mongoUrl.username = encodeURI(process.env.MONGODB_USERNAME)
mongoUrl.password = encodeURI(process.env.MONGODB_PASSWORD)
const mongoClient = new MongoClient(mongoUrl.href)

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
    cookies: {
      secure: true,
      sameSite: 'None',
    },
    devMode: false,
  }
)

// Register callback to execute when serlo editor was successfully launched as a LTI tool.
// See: https://cvmcosta.me/ltijs/#/provider?id=onconnect
Provider.onConnect((_token, _req, res) => {
  const custom: unknown = res.locals.context.custom

  if (!LtiCustomType.is(custom)) {
    sendCustomInvalidErrorMessage(res, _req.path)
    return
  }

  const mayEdit = typeof custom.postContentApiUrl === 'string'

  const url = new URL(process.env.EDITOR_URL + 'editor-for-edusharing')
  url.searchParams.append('ltik', res.locals.ltik)
  url.searchParams.append('mayEdit', mayEdit.toString())

  res.redirect(302, url.href)
})

// Create an async function assigned to server and call it directly afterwards.
const server = (async () => {
  await mongoClient.connect()

  const deeplinkFlows = mongoClient.db().collection('deeplink_flows')
  // Make documents in the `deeplink_flow` expire after `deeplinkFlowMaxAge`
  // seconds.
  //
  // see https://www.mongodb.com/docs/manual/tutorial/expire-data/
  await deeplinkFlows.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: deeplinkFlowMaxAge }
  )

  await app.prepare()
  await Provider.deploy({ serverless: true })

  const server = express()

  server.use('/platform', cookieParser())
  server.use(express.urlencoded({ extended: true }))

  // Use lti.js as a express.js middleware
  // All request to paths '/lti' and '/lti/...' are going through lti.js middleware.
  // See: https://cvmcosta.me/ltijs/#/provider?id=deploying-ltijs-as-part-of-another-server
  server.use('/lti', Provider.app)

  server.get('/lti/get-content', async (_req, res) => {
    const custom: unknown = res.locals.context.custom

    if (!LtiCustomType.is(custom)) {
      sendCustomInvalidErrorMessage(res, _req.path)
      return
    }

    const { token } = res.locals

    const platform = await Provider.getPlatformById(token.platformId)

    const { appId, nodeId, user, getContentApiUrl, version, dataToken } = custom
    const payload = {
      appId,
      nodeId,
      user,
      ...(version != null ? { version } : {}),
      dataToken,
    }
    const message = signJwt({
      payload,
      key: await platform.platformPrivateKey(),
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
    const custom: unknown = res.locals.context.custom

    if (!LtiCustomType.is(custom)) {
      sendCustomInvalidErrorMessage(res, req.path)
      return
    }

    const platform = await Provider.getPlatformById(res.locals.token.platformId)
    const { appId, nodeId, user, postContentApiUrl, dataToken } = custom
    const payload = { appId, nodeId, user, dataToken }
    const message = signJwt({
      payload,
      key: await platform.platformPrivateKey(),
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

  // Called when user clicks on "embed content from edusharing"
  server.use('/lti/start-edusharing-deeplink-flow', async (_req, res) => {
    const custom: unknown = res.locals.context.custom

    if (!LtiCustomType.is(custom)) {
      sendCustomInvalidErrorMessage(res, _req.path)
      return
    }

    const { user, dataToken, nodeId } = custom

    if (dataToken == null) {
      res
        .status(500)
        .setHeader('Content-type', 'text/html')
        .send(createErrorHtml('dataToken is not set'))
      return
    }

    const messageHint: LtiMessageHint = { user, dataToken, nodeId }
    // TODO: edu-sharing seems to only forward this parameter without
    // proper decoding. Thus we need to double encode this parameter.
    // Delete this when edu-sharing has fixed the bug.
    const lti_message_hint = encodeURIComponent(JSON.stringify(messageHint))

    const flowId = (
      await deeplinkFlows.insertOne({ createdAt: new Date() })
    ).insertedId.toString()
    res.setHeader(
      'Set-Cookie',
      `deeplinkFlowId=${flowId}; Max-Age=${deeplinkFlowMaxAge}; HttpOnly; Path=/platform; SameSite=None; Secure`
    )

    // Create a Third-party Initiated Login request
    // See: https://www.imsglobal.org/spec/security/v1p0/#step-1-third-party-initiated-login
    createAutoFromResponse({
      res,
      method: 'GET',
      targetUrl: process.env.EDITOR_LOGIN_INITIATION_URL,
      params: {
        iss: process.env.EDITOR_URL,
        target_link_uri: process.env.EDITOR_TARGET_DEEP_LINK_URL,
        login_hint: process.env.EDITOR_CLIENT_ID,
        client_id: process.env.EDITOR_CLIENT_ID,
        lti_deployment_id: process.env.EDITOR_DEPLOYMENT_ID,
        lti_message_hint,
      },
    })
  })

  server.get('/lti/get-embed-html', async (req, res) => {
    const custom: unknown = res.locals.context.custom

    if (!LtiCustomType.is(custom)) {
      res.json({
        details: `<b>The LTI claim https://purl.imsglobal.org/spec/lti/claim/custom was invalid during request to endpoint ${req.path}</b>`,
      })
      return
    }

    const nodeId = req.query['nodeId']
    const repositoryId = req.query['repositoryId']

    const payload = {
      aud: process.env.EDITOR_CLIENT_ID,
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id':
        process.env.EDITOR_DEPLOYMENT_ID,
      expiresIn: 60,
      dataToken: custom.dataToken,
      'https://purl.imsglobal.org/spec/lti/claim/context': {
        id: process.env.EDITOR_CLIENT_ID,
      },
    }

    const message = signJwtWithBase64Key({
      payload,
      keyid: process.env.EDITOR_KEY_ID,
      key: process.env.EDITOR_PLATFORM_PRIVATE_KEY,
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

  server.use('/platform/keys', async (_req, res) => {
    createJWKSResponse({
      res,
      keyid: process.env.EDITOR_KEY_ID,
      key: process.env.EDITOR_PLATFORM_PUBLIC_KEY,
    })
  })

  // Receives an Authentication Request in payload
  // See: https://www.imsglobal.org/spec/security/v1p0/#step-2-authentication-request
  server.get('/platform/login', async (req, res) => {
    const nonce = req.query['nonce']
    const state = req.query['state']
    const messageHint = req.query['lti_message_hint']

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
    } else if (req.query['client_id'] !== process.env.EDITOR_CLIENT_ID) {
      res.status(400).send('client_id is not valid').end()
      return
    } else if (typeof messageHint !== 'string') {
      res.status(400).send('lti_message_hint is not valid').end()
      return
    }

    let messageHintDecoded: unknown
    try {
      messageHintDecoded = JSON.parse(messageHint)
    } catch {
      res.status(400).send('lti_message_hint is invalid').end()
      return
    }

    if (!LtiMessageHintDecoder.is(messageHintDecoded)) {
      res.status(400).send('lti_message_hint is invalid').end()
      return
    }

    const { user, nodeId, dataToken } = messageHintDecoded

    const flowId = parseDeepflowId({ req, res })
    if (flowId == null) return

    const flowUpdate = await deeplinkFlows.updateOne(
      { _id: flowId },
      { $set: { nonce } }
    )

    if (flowUpdate.modifiedCount === 0) {
      res.status(400).send('cookie deeplinkFlowId is invalid').end()
      return
    }

    // Construct a Authentication Response
    // See: https://www.imsglobal.org/spec/security/v1p0/#step-3-authentication-response
    // An id token is sent back containing a LTI Deep Linking Request Message.
    // See: https://www.imsglobal.org/spec/lti-dl/v2p0#dfn-deep-linking-request-message
    // See https://www.imsglobal.org/spec/lti-dl/v2p0#deep-linking-request-example
    // for an example of a deep linking request payload
    const payload = {
      iss: process.env.EDITOR_URL,

      // TODO: This should be a list. Fix this when edusharing has fixed the
      // parsing of the JWT.
      aud: process.env.EDITOR_CLIENT_ID,
      sub: user,

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

    const token = signJwtWithBase64Key({
      payload,
      keyid: process.env.EDITOR_KEY_ID,
      key: process.env.EDITOR_PLATFORM_PRIVATE_KEY,
    })

    createAutoFromResponse({
      res,
      method: 'POST',
      targetUrl: process.env.EDITOR_TARGET_DEEP_LINK_URL,
      params: { id_token: token, state },
    })
  })

  // Called after the resource selection on Edusharing (within iframe) when user selected what resource to embed.
  // Receives a LTI Deep Linking Response Message in payload. Contains content_items array that specifies which resource should be embedded.
  // See: https://www.imsglobal.org/spec/lti-dl/v2p0#deep-linking-response-message
  // See https://www.imsglobal.org/spec/lti-dl/v2p0#deep-linking-response-example for an example response payload
  server.post('/platform/done', async (req, res) => {
    if (req.headers['content-type'] !== 'application/x-www-form-urlencoded') {
      res
        .status(400)
        .send('"content-type" is not "application/x-www-form-urlencoded"')
        .end()
      return
    }

    if (typeof req.body.JWT !== 'string') {
      res.status(400).send('JWT token is missing in the request').end()
      return
    }

    const flowId = parseDeepflowId({ req, res })
    if (flowId == null) return

    const { value: deeplinkSession } = await deeplinkFlows.findOneAndDelete({
      _id: flowId,
    })

    if (!DeeplinkFlowDecoder.is(deeplinkSession)) {
      res.status(400).send('deeplinkFlowSession is invalid').end()
      return
    }

    const { nonce } = deeplinkSession

    verifyJwt({
      res,
      token: req.body.JWT,
      keysetUrl: process.env.PLATFORM_JWK_SET,
      verifyOptions: {
        issuer: process.env.EDITOR_CLIENT_ID,
        audience: process.env.EDITOR_URL,
        nonce,
      },
      callback(decoded) {
        if (!JwtDeepflowResponseDecoder.is(decoded)) {
          res.status(400).send('malformed custom claim in JWT send').end()
          return
        }

        const { repositoryId, nodeId } =
          decoded[
            'https://purl.imsglobal.org/spec/lti-dl/claim/content_items'
          ][0].custom

        res
          .setHeader('Content-type', 'text/html')
          .send(
            `<!DOCTYPE html>
            <html>
              <body>
                <script type="text/javascript">
                  parent.postMessage({
                    repositoryId: '${repositoryId}',
                    nodeId: '${nodeId}'
                  }, '${process.env.EDITOR_URL}')
                </script>
              </body>
            </html>
          `
          )
          .end()
      },
    })
  })

  // Forward all requests that did not get handled until here to the nextjs request handler.
  server.all('*', (req, res) => {
    return nextJsRequestHandler(req, res)
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

function parseDeepflowId({
  req,
  res,
}: {
  req: express.Request
  res: express.Response
}): ObjectId | null {
  if (typeof req.cookies.deeplinkFlowId != 'string') {
    res.status(400).send('cookie deeplinkFlowId is missing').end()
    return null
  }

  try {
    return new ObjectId(req.cookies.deeplinkFlowId)
  } catch {
    res.status(400).send('cookie deeplinkFlowId is malformed').end()
    return null
  }
}

async function isPortOpen(port: number): Promise<boolean> {
  const server = createServer()

  return new Promise((resolve) => {
    server.once('error', function () {
      // There was an error -> port is probably not open
      server.close(() => resolve(false))
    })

    server.once('listening', function () {
      server.close(() => resolve(true))
    })

    server.listen(port)
  })
}

export default server
