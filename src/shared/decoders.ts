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

export const DeeplinkFlowDecoder = t.type({ nonce: t.string })
export const DeeplinkLoginData = t.type({
  dataToken: t.string,
  nodeId: t.string,
  user: t.string,
})

// Define type for the LTI claim https://purl.imsglobal.org/spec/lti/claim/custom
// Partial contains optional properties.
export const LtiCustomType = t.intersection([
  t.type({
    getContentApiUrl: t.string,
    getDetailsSnippetUrl: t.string,
    appId: t.string,
  }),
  DeeplinkLoginData,
  t.partial({
    fileName: t.string,
    postContentApiUrl: t.string,
    version: t.string,
  }),
])
