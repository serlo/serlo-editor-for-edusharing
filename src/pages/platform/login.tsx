import { useEffect, useRef } from 'react'
import jwt from 'jsonwebtoken'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (context) => {
  // TODO: verify token

  // TODO: Proper parsing
  const messageHintParam = context.query['lti_message_hint'] as string
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
    nonce: context.query.nonce,
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

  const signed = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: 60,
    keyid: process.env.EDITOR_KEY_ID,
  })

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

// TODO: Use typecheck in server to sync types
interface MessageHint {
  user: string
  dataToken: string
  nodeId: string
}
