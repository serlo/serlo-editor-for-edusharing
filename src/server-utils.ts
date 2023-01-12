import type { Response } from 'express'
import jwt, { VerifyOptions } from 'jsonwebtoken'
import JSONWebKey from 'json-web-key'
import JWKSClient, { JwksClient } from 'jwks-rsa'
import nextEnv from '@next/env'

const doNothingLogger = {
  info: () => void 0,
  error: () => void 0,
}

const jwksClients: Record<string, JwksClient | undefined> = {}

export function loadEnvConfig(args?: { showLogs?: boolean }) {
  const showLogs = args?.showLogs ?? true
  nextEnv.loadEnvConfig(
    process.cwd(),
    true,
    showLogs ? console : doNothingLogger
  )
}

export function createJWKSResponse(args: {
  res: Response
  keyid: string
  key: string
}) {
  const { res, keyid, key } = args

  res
    .json({
      keys: [
        {
          kid: keyid,
          alg: 'RS256',
          use: 'sig',
          ...JSONWebKey.fromPEM(
            Buffer.from(key, 'base64').toString('utf-8')
          ).toJSON(),
        },
      ],
    })
    .end()
}

export function signJwtWithBase64Key({
  payload,
  keyid,
  key,
}: {
  payload: Record<string, unknown>
  keyid: string
  key: string
}) {
  return signJwt({
    payload,
    keyid,
    key: Buffer.from(key, 'base64').toString('utf-8'),
  })
}

export function signJwt({
  payload,
  keyid,
  key,
}: {
  payload: Record<string, unknown>
  keyid: string
  key: string
}) {
  return jwt.sign(payload, key, {
    algorithm: 'RS256',
    expiresIn: 60,
    keyid,
  })
}

export function verifyJwt(args: {
  token: string
  res: Response
  verifyOptions: VerifyOptions
  keysetUrl: string
  callback: (decoded: jwt.JwtPayload) => void
}) {
  const { res, token, verifyOptions, keysetUrl, callback } = args

  jwt.verify(token, getKey, verifyOptions, (err, decoded) => {
    if (err != null) {
      res.status(400).send(err.message).end()
      return
    } else {
      // TODO: Use no "as"
      callback(decoded as jwt.JwtPayload)
    }
  })

  function getKey(
    header: { kid?: string },
    callback: (_: Error, key: string) => void
  ) {
    if (header.kid == null) {
      res.status(400).send('No keyid was provided in the JWT').end()
    } else {
      fetchSigningKey(header.kid)
        .then((key) => {
          if (typeof key === 'string') {
            callback(null, key)
          }
        })
        .catch((err) => {
          console.log(err)
          res.status(400).send(err.message)
        })
    }
  }

  async function fetchSigningKey(keyid: string): Promise<string | null> {
    const jwksClient =
      jwksClients[keysetUrl] != null
        ? jwksClients[keysetUrl]
        : JWKSClient({
            jwksUri: keysetUrl,
            cache: process.env.NODE_ENV === 'production',
          })

    jwksClients[keysetUrl] = jwksClient

    try {
      const signingKey = await jwksClient.getSigningKey(keyid)

      return signingKey.getPublicKey()
    } catch (err) {
      res
        .status(502)
        .send('An error occured while fetching key from the keyset URL')
        .end()

      return null
    }
  }
}

export function createAutoFromResponse({
  res,
  method = 'GET',
  targetUrl,
  params,
}: {
  res: Response
  method?: 'GET' | 'POST'
  targetUrl: string
  params: Record<string, string>
}) {
  const escapedTargetUrl = escapeHTML(targetUrl)
  const formDataHtml = Object.entries(params)
    .map(([name, value]) => {
      const escapedValue = escapeHTML(value)
      return `<input type="hidden" name="${name}" value="${escapedValue}" />`
    })
    .join('\n')

  res.setHeader('Content-Type', 'text/html')
  res.send(
    `
    <!DOCTYPE html>
    <html>
    <head><title>Redirect to ${escapedTargetUrl}</title></head>
    <body>
      <form id="form" action="${escapedTargetUrl}" method="${method}">
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

function escapeHTML(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
