import { useEffect, useRef } from 'react'
import jwt from 'jsonwebtoken'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (context) => {
  // TODO: verify token
  
  // TODO: Use session to give information further
  // TODO: Proper parsing
  const messageHintParam = context.query['lti_message_hint'] as string
  const messageHint = JSON.parse(messageHintParam) as MessageHint
  const message = {
    iss: process.env.EDITOR_URL,
    // TODO: Should be a list
    aud: process.env.EDITOR_CLIENT_ID,
    // TODO: Set this to the current user
    sub: messageHint.user,

    iat: Date.now(),
    nonce: context.query.nonce,

    dataToken: messageHint.dataToken,

    // TODO: no idea where this should be coming from
    'https://purl.imsglobal.org/spec/lti/claim/deployment_id':
      process.env.EDITOR_DEPLOYMENT_ID,
    'https://purl.imsglobal.org/spec/lti/claim/message_type':
      messageHint.type === 'deep-link'
        ? 'LtiDeepLinkingRequest'
        : 'LtiResourceLinkRequest',
    'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
    'https://purl.imsglobal.org/spec/lti/claim/roles': [],
    'https://purl.imsglobal.org/spec/lti/claim/context': {
      id: messageHint.nodeId,
    },

    ...(messageHint.type === 'deep-link'
      ? {
          'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings':
            {
              accept_types: ['ltiResourceLink'],
              //accept_presentation_document_targets: ['frame', 'iframe', 'window'],
              accept_presentation_document_targets: ['iframe'],
              //accept_copy_advice: false,
              accept_multiple: true,
              //accept_unsigned: false,
              auto_create: false,
              //can_confirm: false,
              deep_link_return_url: `${process.env.EDITOR_URL}/platform/done`,
              title: '',
              text: '',
            },
        }
      : {
          'https://purl.imsglobal.org/spec/lti/claim/target_link_uri':
            messageHint.resourceLink,
          'https://purl.imsglobal.org/spec/lti/claim/resource_link': {
            id: `${process.env.EDITOR_CLIENT_ID}${process.env.EDITOR_DEPLOYMENT_ID}`,
            title: '',
          },
          'https://purl.imsglobal.org/spec/lti/claim/launch_presentation': {
            locale: 'de',
            document_target: 'iframe',
          },
        }),
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

// TODO: Find a better place for this
export type MessageHint = DeepLinkMessage | ResourceLinkMessage

interface DeepLinkMessage {
  type: 'deep-link'
  user: string
  dataToken: string
  nodeId: string
}

interface ResourceLinkMessage {
  type: 'resource-link'
  user: string
  dataToken: string
  resourceLink: string
  nodeId: string
}
