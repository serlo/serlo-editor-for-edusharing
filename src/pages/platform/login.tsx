import { useEffect, useRef } from 'react'

const jwt = require('jsonwebtoken')
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (context) => {
  // TODO: verify token

  const message = {
    iss: 'http://localhost:3000/',
    // TODO: Should be a list
    aud: 'editor',
    // TODO: no idea where this should be coming from
    sub: '0ae836b9-7fc9-4060-006f-27b2066ac545',

    iat: Date.now(),
    nonce: context.query.nonce,

    // TODO: no idea where this should be coming from
    'https://purl.imsglobal.org/spec/lti/claim/deployment_id': '2',
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
      accept_types: ['ltiResourceLink'],
      //accept_presentation_document_targets: ['frame', 'iframe', 'window'],
      accept_presentation_document_targets: ['iframe'],
      //accept_copy_advice: false,
      accept_multiple: true,
      //accept_unsigned: false,
      auto_create: false,
      //can_confirm: false,
      deep_link_return_url: 'http://localhost:3000/platform/done',
      title: 'OEH Redaktion',
      text: '',
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

  //console.log(4289080)
  //console.log(jwt.verify(signed, 'hkjhk'))

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
