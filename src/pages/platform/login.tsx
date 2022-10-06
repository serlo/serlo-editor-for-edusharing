import { useEffect, useRef } from 'react'
import { v4 } from 'uuid'

const jwt = require('jsonwebtoken')
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (context) => {
  // TODO: verify token

  const message = {
    iss: process.env.PROVIDER_URL,
    aud: ['editor'],
    // TODO: no idea where this should be coming from
    sub: '0ae836b9-7fc9-4060-006f-27b2066ac545',

    iat: Date.now(),
    nonce: v4(),

    // TODO: no idea where this should be coming from
    'https://purl.imsglobal.org/spec/lti/claim/deployment_id':
      '8c49a5fa-f955-405e-865f-3d7e959e809f',
    'https://purl.imsglobal.org/spec/lti/claim/message_type':
      'LtiDeepLinkingRequest',
    'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
    'https://purl.imsglobal.org/spec/lti/claim/roles': [],

    // 'https://purl.imsglobal.org/spec/lti/claim/launch_presentation': {
    //   document_target: 'iframe',
    //   height: 320,
    //   width: 240,
    // },

    'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings': {
      // TODO: host
      deep_link_return_url: 'http://localhost:3000/platform/done',
      accept_types: ['ltiResourceLink'],
      // accept_media_types: 'image/*,text/html',
      // accept_presentation_document_targets: ['iframe', 'window', 'embed'],
      // accept_multiple: true,
      // auto_create: true,
      // title: 'This is the default title',
      // text: 'This is the default text',
      // data: 'csrftoken:c7fbba78-7b75-46e3-9201-11e6d5f36f53',
    },
  }

  const privateKey = Buffer.from(
    process.env.EDITOR_PLATFORM_PRIVATE_KEY,
    'base64'
  ).toString('utf-8')

  const signed = jwt.sign(message, privateKey, {
    algorithm: 'RS256',
    expiresIn: 60,
    keyid: '42',
  })

  console.log(signed)

  return {
    props: {
      jwt: signed,
      redirectUri: context.query.redirect_uri,
      state: context.query.state,
    },
  }
}

export default function Login({ jwt, redirectUri, state }) {
  const formRef = useRef(null)

  useEffect(() => {
    formRef.current.submit()
  }, [])

  return (
    <form ref={formRef} action={redirectUri} method="POST">
      <input type="hidden" name="id_token" value={jwt} />
      <input type="hidden" name="state" value={state} />
    </form>
  )
}
