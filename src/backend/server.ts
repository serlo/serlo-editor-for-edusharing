import express from 'express'
import { MongoClient, ObjectId } from 'mongodb'
import { Provider } from 'ltijs'
import Server from 'next/dist/server/next-server.js'
import type { NextServer } from 'next/dist/server/next'
import { defaultImport } from 'default-import'
import { createServer } from 'net'
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
  DeeplinkNonce,
  DeeplinkLoginData,
  JwtDeepflowResponseDecoder,
  LtiCustomType,
} from '../shared/decoders'
import { StorageFormatRuntimeType } from '../shared/storage-format'

const port = parseInt(process.env.PORT, 10) || 3000
const isDevEnvironment = process.env.NODE_ENV !== 'production'

if (isDevEnvironment && !(await isPortOpen(port))) {
  console.error(`ERROR: Cannot listen on port ${port}`)
  console.error(
    `Probably there is already a dev server running -> so we do not start another server`
  )
  process.exit(0)
}

let app: Server | NextServer

if (process.env.NODE_ENV == 'production') {
  const NextServer = defaultImport(Server)
  app = new NextServer({
    dev: false,
    conf: global.NEXT_CONFIG,
  })
} else {
  loadEnvConfig()
  const next = (await import('next')).default
  app = next({ dev: true })
}

const nextJsRequestHandler = app.getRequestHandler()

const mongoUrl = new URL(process.env.MONGODB_URL)
if (process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD) {
  mongoUrl.username = encodeURI(process.env.MONGODB_USERNAME)
  mongoUrl.password = encodeURI(process.env.MONGODB_PASSWORD)
}
const mongoClient = new MongoClient(mongoUrl.href)

const ltiMongoConnection: any = {
  url: process.env.MONGODB_URL,
}
if (process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD) {
  ltiMongoConnection.connection = {
    user: process.env.MONGODB_USERNAME,
    pass: process.env.MONGODB_PASSWORD,
  }
}

Provider.setup(
  process.env.EDITOR_KEY_FOR_SIGNING_COOKIES_AND_ENCRYPTING_DATABASE_ENTRIES, //
  ltiMongoConnection,
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
}, null)

// Create an async function assigned to server and call it directly afterwards.
const server = (async () => {
  await mongoClient.connect()

  const deeplinkNonces = mongoClient.db().collection('deeplink_nonces')
  const deeplinkLoginData = mongoClient.db().collection('deeplink_login_data')
  // Make documents in the mongodb collections expire after `deeplinkFlowMaxAge`
  // seconds.
  //
  // see https://www.mongodb.com/docs/manual/tutorial/expire-data/
  await deeplinkNonces.createIndex(
    { createdAt: 1 },
    // Since in the deeplink flow a user activity is integrated (choosing
    // the asset to include) we need a longer wait time
    { expireAfterSeconds: 60 * 60 }
  )
  await deeplinkLoginData.createIndex(
    { createdAt: 1 },
    // Since edusharing should directly redirect the user to our page a small
    // max age should be fine her
    { expireAfterSeconds: 20 }
  )

  await app.prepare()
  await Provider.deploy({ serverless: true })

  const server = express()
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

  server.post('/lti/save-content', express.json(), async (req, res) => {
    const custom: unknown = res.locals.context.custom

    if (!LtiCustomType.is(custom)) {
      sendCustomInvalidErrorMessage(res, req.path)
      return
    }

    const content: unknown = req.body
    if (!StorageFormatRuntimeType.is(content)) {
      res.status(400).json({
        error:
          'Content submitted to /lti/save-content was malformed. See StorageFormat.',
        status: 401,
      })
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

    if (postContentApiUrl == null) {
      res.status(400).json({ error: 'Editor was not opened in edit mode' })
      return
    }

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

    // https://stackoverflow.com/a/50774380
    const blob = new Blob([JSON.stringify(content)], {
      type: 'application/json',
    })

    const data = new FormData()
    data.set('file', blob)

    // https://medium.com/deno-the-complete-reference/sending-form-data-using-fetch-in-node-js-8cedd0b2af85
    const response = await fetch(url.href, {
      method: 'POST',
      body: data,
    })

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

    const loginData = await deeplinkLoginData.insertOne({
      createdAt: new Date(),
      user,
      dataToken,
      nodeId,
    })

    // Create a Third-party Initiated Login request
    // See: https://www.imsglobal.org/spec/security/v1p0/#step-1-third-party-initiated-login
    createAutoFromResponse({
      res,
      method: 'GET',
      targetUrl: process.env.EDUSHARING_LOGIN_INITIATION_URL_FOR_EMBEDDING,
      params: {
        iss: process.env.EDITOR_URL,
        target_link_uri:
          process.env.EDUSHARING_AUTHENTICATION_RESPONSE_URL_FOR_EMBEDDING,
        login_hint: loginData.insertedId.toString(),
        client_id: process.env.EDITOR_CLIENT_ID_FOR_EMBEDDING,
        lti_deployment_id: process.env.EDITOR_DEPLOYMENT_ID_FOR_EMBEDDING,
      },
    })
  })

  server.get('/lti/get-embed-html', async (req, res) => {
    const custom: unknown = res.locals.context.custom

    if (!LtiCustomType.is(custom)) {
      res.json({
        detailsSnippet: `<b>The LTI claim https://purl.imsglobal.org/spec/lti/claim/custom was invalid during request to endpoint ${req.path}</b>`,
      })
      return
    }

    const nodeId = req.query['nodeId']
    const repositoryId = req.query['repositoryId']

    const payload = {
      aud: process.env.EDITOR_CLIENT_ID_FOR_EMBEDDING,
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id':
        process.env.EDITOR_DEPLOYMENT_ID_FOR_EMBEDDING,
      expiresIn: 60,
      dataToken: custom.dataToken,
      'https://purl.imsglobal.org/spec/lti/claim/context': {
        id: process.env.EDITOR_CLIENT_ID_FOR_EMBEDDING,
      },
    }

    const message = signJwtWithBase64Key({
      payload,
      keyid: process.env.EDITOR_KEY_ID_FOR_EMBEDDING,
      key: process.env.EDITOR_PRIVATE_KEY_FOR_EMBEDDING,
    })

    const url = new URL(
      process.env.EDUSHARING_DETAILS_URL_FOR_EMBEDDING +
        `/${repositoryId}/${nodeId}`
    )

    url.searchParams.append('displayMode', 'inline')
    url.searchParams.append('jwt', encodeURIComponent(message))

    // HACK: Replace host when in docker, see .env
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
      res.json({
        responseStatus: response.status,
        responseText: await response.text(),
        detailsSnippet:
          '<b>Es ist ein Fehler aufgetreten, den edu-sharing Inhalt einzubinden. Bitte wenden Sie sich an den Systemadministrator.</b>',
      })
    } else {
      // TODO: Error handling
      res.json(await response.json())
    }
  })

  server.use('/platform/keys', async (_req, res) => {
    createJWKSResponse({
      res,
      keyid: process.env.EDITOR_KEY_ID_FOR_EMBEDDING,
      key: process.env.EDITOR_PUBLIC_KEY_FOR_EMBEDDING,
    })
  })

  // Receives an Authentication Request in payload
  // See: https://www.imsglobal.org/spec/security/v1p0/#step-2-authentication-request
  server.get('/platform/login', async (req, res) => {
    const nonce = req.query['nonce']
    const state = req.query['state']
    const loginHint = req.query['login_hint']

    if (typeof nonce !== 'string') {
      res.status(400).send('nonce is not valid').end()
      return
    } else if (typeof state !== 'string') {
      res.status(400).send('state is not valid').end()
      return
    } else if (
      req.query['redirect_uri'] !==
      process.env.EDUSHARING_AUTHENTICATION_RESPONSE_URL_FOR_EMBEDDING
    ) {
      res.status(400).send('redirect_uri is not valid').end()
      return
    } else if (
      req.query['client_id'] !== process.env.EDITOR_CLIENT_ID_FOR_EMBEDDING
    ) {
      res.status(400).send('client_id is not valid').end()
      return
    } else if (typeof loginHint !== 'string') {
      res.status(400).send('login_hint is not valid').end()
      return
    }

    const loginDataId = parseObjectId(loginHint)

    if (loginDataId == null) {
      res.status(400).send('login_hint is not valid').end()
      return
    }

    const { value: loginData } = await deeplinkLoginData.findOneAndDelete({
      _id: loginDataId,
    })

    if (!DeeplinkLoginData.is(loginData)) {
      res.status(400).send('login_hint is invalid or session is expired').end()
      return
    }

    const { user, nodeId, dataToken } = loginData

    const nonceId = await deeplinkNonces.insertOne({
      createdAt: new Date(),
      nonce,
    })

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
      aud: process.env.EDITOR_CLIENT_ID_FOR_EMBEDDING,
      sub: user,

      nonce,
      dataToken,

      'https://purl.imsglobal.org/spec/lti/claim/deployment_id':
        process.env.EDITOR_DEPLOYMENT_ID_FOR_EMBEDDING,
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
        data: nonceId.insertedId.toString(),
      },
    }

    const token = signJwtWithBase64Key({
      payload,
      keyid: process.env.EDITOR_KEY_ID_FOR_EMBEDDING,
      key: process.env.EDITOR_PRIVATE_KEY_FOR_EMBEDDING,
    })

    createAutoFromResponse({
      res,
      method: 'POST',
      targetUrl:
        process.env.EDUSHARING_AUTHENTICATION_RESPONSE_URL_FOR_EMBEDDING,
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

    const verifyResult = await verifyJwt({
      token: req.body.JWT,
      keysetUrl: process.env.EDUSHARING_KEYSET_URL,
      verifyOptions: {
        issuer: process.env.EDITOR_CLIENT_ID_FOR_EMBEDDING,
        audience: process.env.EDITOR_URL,
      },
    })

    if (verifyResult.success === false) {
      res.status(verifyResult.status).send(verifyResult.error)
      return
    }

    const { decoded } = verifyResult
    const data = decoded['https://purl.imsglobal.org/spec/lti-dl/claim/data']

    if (typeof data !== 'string') {
      res.status(400).send('data claim in JWT is missing').end()
      return
    }

    const nonceId = parseObjectId(data)

    if (nonceId == null) {
      res.status(400).send('data claim in JWT is invalid').end()
      return
    }

    const { value: nonceValueFromDB } = await deeplinkNonces.findOneAndDelete({
      _id: nonceId,
    })

    if (!DeeplinkNonce.is(nonceValueFromDB)) {
      res.status(400).send('deeplink flow session expired').end()
      return
    }

    if (decoded.nonce !== nonceValueFromDB.nonce) {
      res.status(400).send('nonce is invalid').end()
      return
    }

    if (!JwtDeepflowResponseDecoder.is(decoded)) {
      res.status(400).send('malformed custom claim in JWT send').end()
      return
    }

    const { repositoryId, nodeId } =
      decoded['https://purl.imsglobal.org/spec/lti-dl/claim/content_items'][0]
        .custom

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
  })

  // Forward all requests that did not get handled until here to the nextjs request handler.
  server.all('*', (req, res) => {
    return nextJsRequestHandler(req, res)
  })

  server.listen(port, () => {
    console.log(`> Ready on ${process.env.EDITOR_URL}`)
  })

  await Provider.registerPlatform({
    url: process.env.EDUSHARING_URL,
    name: 'Platform',
    clientId: process.env.EDITOR_CLIENT_ID_FOR_LAUNCH,
    authenticationEndpoint:
      process.env.EDUSHARING_AUTHENTICATION_URL_FOR_LAUNCH,
    accesstokenEndpoint: process.env.EDUSHARING_ACCESSTOKEN_URL,
    authConfig: {
      method: 'JWK_SET',
      key: process.env.EDUSHARING_KEYSET_URL,
    },
  })
})()

function parseObjectId(objectId: string): ObjectId | null {
  try {
    return new ObjectId(objectId)
  } catch {
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
