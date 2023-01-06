import express from 'express'
import jwt from 'jsonwebtoken'
import JSONWebKey from 'json-web-key'
import { emptyDocument } from './storage-format'
import { createAutoFromResponse } from './server-utils'

export class EdusharingServer {
  private defaultCustom = {
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
  }
  private custom = this.defaultCustom
  private app = express()
  public savedVersions: Array<{ comment: string }> = []

  constructor() {
    this.app.get('/', (_req, res) => {
      createAutoFromResponse({
        res,
        targetUrl: process.env.EDITOR_URL + 'lti/login',
        params: {
          target_link_uri: 'http://localhost:3000/lti',
          iss: process.env.PLATFORM_URL,

          // Test whether this is optional
          login_hint: 'admin',
          lti_message_hint: 'd882efaa-1f84-4a0f-9bc9-4f74f19f7576',
          lti_deployment_id: '1',
          client_id: process.env.PLATFORM_CLIENT_ID,
        },
      })
    })

    this.app.get('/edu-sharing/rest/ltiplatform/v13/auth', (req, res) => {
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
        'https://purl.imsglobal.org/spec/lti/claim/custom': this.custom,
      }

      createAutoFromResponse({
        res,
        method: 'POST',
        targetUrl: process.env.EDITOR_URL + '/lti',
        params: {
          id_token: signJWT(payload),
          state: req.query['nonce'].toString(),
        },
      })
    })

    this.app.get('/edu-sharing/rest/lti/v13/jwks', (_req, res) => {
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

    this.app.get('/edu-sharing/rest/ltiplatform/v13/content', (_req, res) => {
      res.json(emptyDocument).end()
    })

    this.app.post('/edu-sharing/rest/ltiplatform/v13/content', (req, res) => {
      this.savedVersions.push({ comment: `${req.query['versionComment']}` })
      console.log(
        `[${new Date().toISOString()}]: Save registered with comment ${
          req.query['versionComment']
        }`
      )
      res.sendStatus(200).end()
    })

    this.app.get(
      '/edu-sharing/rest/lti/v13/oidc/login_initiations',
      (req, res) => {
        const targetParameters = {
          iss: process.env.EDITOR_URL,
          target_link_uri: process.env.EDITOR_TARGET_DEEP_LINK_URL,
          login_hint: process.env.EDITOR_CLIENT_ID,
          client_id: process.env.EDITOR_CLIENT_ID,
          lti_deployment_id: process.env.EDITOR_DEPLOYMENT_ID,
        }

        for (const [name, value] of Object.entries(targetParameters)) {
          if (req.query[name] !== value) {
            res
              .status(400)
              .json({
                error: `Editor send invalid value '${req.query[name]}' for '${name}'`,
                context: 'deeplink-flow',
                location: req.route.path,
              })
              .end()
            return
          }
        }

        createAutoFromResponse({
          res,
          method: 'GET',
          targetUrl: process.env.EDITOR_URL + 'platform/login',
          params: {
            nonce: 'nonce',
            state: 'state',
            user: req.query['user'].toString(),
            dataToken: req.query['dataToken'].toString(),
            nodeId: req.query['nodeId'].toString(),
            redirect_uri: process.env.EDITOR_TARGET_DEEP_LINK_URL,
            client_id: process.env.PLATFORM_CLIENT_ID,
          },
        })
      }
    )

    this.app.post('/edu-sharing/rest/lti/v13/lti13', (_req, res) => {
      const payload = {
        iss: 'editor',
        aud: 'http://localhost:3000/',
        iat: Date.now(),
        nonce: 'nonce',
        azp: 'http://localhost:3000/',
        'https://purl.imsglobal.org/spec/lti/claim/deployment_id': '2',
        'https://purl.imsglobal.org/spec/lti/claim/message_type':
          'LtiDeepLinkingResponse',
        'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
        'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': [
          {
            custom: {
              repositoryId: 'serlo-edusharing',
              nodeId: '960c48d0-5e01-45ca-aaf6-d648269f0db2',
            },
            icon: {
              width: 'null',
              url: 'http://repository.127.0.0.1.nip.io:8100/edu-sharing/themes/default/images/common/mime-types/svg/file-image.svg',
              height: 'null',
            },
            type: 'ltiResourceLink',
            title: '2020-11-13-152700_392x305_scrot.png',
            url: 'http://repository.127.0.0.1.nip.io:8100/edu-sharing/rest/lti/v13/lti13/960c48d0-5e01-45ca-aaf6-d648269f0db2',
          },
        ],
      }

      createAutoFromResponse({
        res,
        method: 'POST',
        targetUrl: process.env.EDITOR_URL + 'platform/done',
        params: {
          JWT: signJWT(payload),
        },
      })
    })

    this.app.get('/edu-sharing/rest/lti/v13/details/*/*', (_req, res) => {
      res
        .json({
          detailsSnippet:
            '<p><b>Inhalt von edu-sharing</b></p><p><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Aurora_in_Abisko_near_Tornetr%C3%A4sk.jpg/640px-Aurora_in_Abisko_near_Tornetr%C3%A4sk.jpg" /></p>',
        })
        .end()
    })

    this.app.all('*', (req, res) => {
      console.error(`${req.method} call to ${req.url} registered`)
      res.sendStatus(404)
    })
  }

  init() {
    this.savedVersions = []
    this.custom = this.defaultCustom
  }

  // TODO: Better function
  deleteDataToken() {
    delete this.custom['dataToken']
  }

  listen(port: number, callback: () => void) {
    this.app.listen(port, callback)
  }
}

function signJWT(payload: Record<string, unknown>) {
  const privateKey = Buffer.from(
    process.env.EDITOR_PLATFORM_PRIVATE_KEY,
    'base64'
  ).toString('utf-8')

  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: 60,
    keyid: 'key',
  })
}
