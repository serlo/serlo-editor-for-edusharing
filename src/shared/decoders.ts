import * as t from 'io-ts'

export const EdusharingAssetDecoder = t.type({
  nodeId: t.string,
  repositoryId: t.string,
})

export const JwtDeepflowResponseDecoder = t.type({
  'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': t.array(
    t.type({
      custom: EdusharingAssetDecoder,
    })
  ),
})

export const LtiMessageHintDecoder = t.type({
  user: t.string,
  dataToken: t.string,
  nodeId: t.string,
})
export type LtiMessageHint = t.TypeOf<typeof LtiMessageHintDecoder>

export const DeeplinkFlowDecoder = t.type({ nonce: t.string, state: t.string })