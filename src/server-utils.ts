import type { Response } from 'express'
import jwt from 'jsonwebtoken'
import JSONWebKey from 'json-web-key'
import nextEnv from '@next/env'

const doNothingLogger = {
  info: () => void 0,
  error: () => void 0,
}

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
