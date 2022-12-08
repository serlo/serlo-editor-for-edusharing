import express from 'express'
import jwt from 'jsonwebtoken'
import { loadEnvConfig } from '@next/env'
import JSONWebKey from 'json-web-key'
import { emptyDocument } from './src/storage-format'

loadEnvConfig(process.cwd())
const edusharingPort = 8100

const app = express()

app.get('/', (_req, res) => {
  createAutoFromResponse({
    res,
    targetUrl: process.env.EDITOR_URL + 'lti/login',
    params: {
      target_link_uri: 'http://localhost:3000/lti',
      iss: 'http://repository.127.0.0.1.nip.io:8100/edu-sharing',

      // Test whether this is optional
      login_hint: 'admin',
      lti_message_hint: 'd882efaa-1f84-4a0f-9bc9-4f74f19f7576',
      lti_deployment_id: '1',
      client_id: 'qsa2DgKBJ2WgoJO',
    },
  })
})

app.get('/edu-sharing/rest/ltiplatform/v13/auth', (req, res) => {
  // http://repository.127.0.0.1.nip.io:8100/edu-sharing/rest/ltiplatform/v13/auth?response_type=id_token&response_mode=form_post&id_token_signed_response_alg=RS256&scope=openid&client_id=qsa2DgKBJ2WgoJO&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Flti&login_hint=admin&nonce=43pesgc8i6ptw83xpvwaa00tc&prompt=none&state=5e867c7aae19b74e9a3815ea38b2c8f848f91c6b2c4468d890&lti_message_hint=d882efaa-1f84-4a0f-9bc9-4f74f19f7576&lti_deployment_id=1

  const payload = {
    nonce: req.query['nonce'],
    iss: 'http://repository.127.0.0.1.nip.io:8100/edu-sharing',
    iat: Date.now(),
    aud: process.env.PLATFORM_CLIENT_ID,
    sub: 'admin',
    'https://purl.imsglobal.org/spec/lti/claim/deployment_id': '1',
    'https://purl.imsglobal.org/spec/lti/claim/context': {
      id: 'd882efaa-1f84-4a0f-9bc9-4f74f19f7576',
      label: 'Home des Unternehmens',
    },
    given_name: 'Administrator',
    family_name: '',
    email: 'admin@alfresco.com',
    'https://purl.imsglobal.org/spec/lti/claim/tool_platform': {
      name: 'local',
      product_family_code: 'edu-sharing',
      guid: 'serlo-edusharing',
      description: 'local',
      version: '9999.14076175.9999',
    },
    'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
    'https://purl.imsglobal.org/spec/lti/claim/roles': [],
    'https://purl.imsglobal.org/spec/lti/claim/target_link_uri':
      'http://localhost:3000/lti',
    'https://purl.imsglobal.org/spec/lti/claim/resource_link': {
      id: '604f62c1-6463-4206-a571-8c57097a54ae',
      title: 'Hello worldd',
    },
    'https://purl.imsglobal.org/spec/lti/claim/launch_presentation': {
      document_target: 'window',
      return_url:
        'http://repository.127.0.0.1.nip.io:8100/edu-sharing/components/workspace?id=d882efaa-1f84-4a0f-9bc9-4f74f19f7576&mainnav=true&displayType=0',
      locale: 'de_DE',
    },
    'https://purl.imsglobal.org/spec/lti/claim/message_type':
      'LtiResourceLinkRequest',
    'https://purl.imsglobal.org/spec/lti/claim/custom': {
      getContentApiUrl:
        'http://repository.127.0.0.1.nip.io:8100/edu-sharing/rest/ltiplatform/v13/content',
      fileName: 'Hello worldd',
      getDetailsSnippetUrl:
        'http://repository.127.0.0.1.nip.io:8100/edu-sharing/rest/lti/v13/details',
      dataToken:
        'kOXGc6AbqYW7iHOl3b48Pj/ngudoLCZk+DJwYxAg9wTiKsN9TKRY13qU+6vNNMEV2Guya3NPWO+Ay8IJDtQWMKxnkku/3mc+n64TIgMjs2yY7wXMYcvoRK4C9iXXpydNWQCGreYU2BcnMwne/b5BngOvBjqqVCPLMGT/lmvylP//GCzM7V99h9fKVMrgY97qOdsB1O0Ti//E3odWU1dFUMu3NLPy3MdTHXdViQpyPFRpgnZ8kcywDl0bLYSKy0pUuJy0hBvlnGmFyKlcQ38HaR2CZ9wRxrNgRxxEzGd8J+T6YSNoD8OyB9Nyjbp0N3tog4XhEZ/UASIqLYBzk+ygOA==',
      postContentApiUrl:
        'http://repository.127.0.0.1.nip.io:8100/edu-sharing/rest/ltiplatform/v13/content',
      appId: 'qsa2DgKBJ2WgoJO1',
      nodeId: '604f62c1-6463-4206-a571-8c57097a54ae',
      user: 'admin',
    },
  }

  const privateKey = Buffer.from(
    process.env.EDITOR_PLATFORM_PRIVATE_KEY,
    'base64'
  ).toString('utf-8')

  const signed = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: 60,
    keyid: 'key',
  })

  createAutoFromResponse({
    res,
    method: 'POST',
    targetUrl: process.env.EDITOR_URL + '/lti',
    params: { id_token: signed, state: req.query['nonce'].toString() },
  })
})

app.get('/edu-sharing/rest/lti/v13/jwks', (_req, res) => {
  res
    .json({
      keys: [
        {
          kid: 'key',
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

app.get('/edu-sharing/rest/ltiplatform/v13/content', (_req, res) => {
  res.json(emptyDocument).end()
})

app.get('*', (req, res) => {
  console.log(`Call to ${req.url} registered`)
  res.sendStatus(404)
})

app.listen(edusharingPort, () => {
  console.log('INFO: Mocked version of edusharing is ready.')
  console.log(
    `Open http://localhost:${edusharingPort}/ to open the Serlo Editor via LTI`
  )
})

function createAutoFromResponse({
  res,
  method = 'GET',
  targetUrl,
  params,
}: {
  res: express.Response
  method?: 'GET' | 'POST'
  targetUrl: string
  params: Record<string, string>
}) {
  const formDataHtml = Object.entries(params)
    .map(([name, value]) => {
      const encodedValue = encodeURI(value)

      return `<input type="hidden" name="${name}" value="${encodedValue}" />`
    })
    .join('\n')

  res.setHeader('Content-Type', 'text/html')
  res.send(
    `
    <!DOCTYPE html>
    <html>
    <head><title>Redirect to ${targetUrl}</title></head>
    <body>
      <form id="form" action="${targetUrl}" method="${method}">
        ${formDataHtml}
      </form>
      <script type="text/javascript">
        document.getElementById("form").submit();
      </script>
    </body>
    </html>
  `.trim()
  )
  res.end()
}

export {}
