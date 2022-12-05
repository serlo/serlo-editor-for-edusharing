import express from 'express'
import nextEnv from '@next/env'

const { loadEnvConfig } = nextEnv

loadEnvConfig(process.cwd())

const app = express()

app.get('/', (_req, res) => {
  const url = new URL(process.env.EDITOR_URL + 'lti/login')

  url.searchParams.append('target_link_uri', 'http://localhost:3000/lti')
  url.searchParams.append(
    'iss',
    'http://repository.127.0.0.1.nip.io:8100/edu-sharing'
  )
  // Test whether this is optional
  url.searchParams.append('login_hint', 'admin')
  url.searchParams.append(
    'lti_message_hint',
    'd882efaa-1f84-4a0f-9bc9-4f74f19f7576'
  )
  url.searchParams.append('lti_deployment_id', '1')
  url.searchParams.append('client_id', 'qsa2DgKBJ2WgoJO')

  // TODO: Use autoform
  res.setHeader('Content-type', 'text/html').send(`
    <!DOCTYPE html>
    <html>
    <head><title>Serlo Editor Test-Umgebung</title><head>
    <body>
      <h1>Test Seite</h1>
      <iframe src="${url.href}" style="width: 100%; height: 90vh;"/>
    </body>
    </html>
  `)
})

app.listen(3001, () => {
  console.log('ready')
})

export {}
