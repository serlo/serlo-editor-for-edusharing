import * as t from 'io-ts'

export const jwtDeepflowResponseDecoder = t.type({
  'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': t.array(
    t.type({
      custom: t.type({ nodeId: t.string, repositoryId: t.string }),
    })
  ),
})

export const LtiMessageHint = t.type({
  user: t.string,
  dataToken: t.string,
  nodeId: t.string,
})
export type LtiMessageHint = t.TypeOf<typeof LtiMessageHint>
