import jwt from 'jsonwebtoken'
import { GetServerSideProps } from 'next'
import { parseBody } from 'next/dist/server/api-utils/node'
import { useEffect } from 'react'

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const body = await parseBody(context.req, '1mb')
  const token = body.JWT

  // TODO: verify token
  const decoded = jwt.decode(token, { complete: true })

  // Test scheme
  const asset = decoded.payload[
    'https://purl.imsglobal.org/spec/lti-dl/claim/content_items'
  ][0]['custom'] as EdusharingAsset

  return {
    props: { ...asset, targetOrigin: process.env.EDITOR_URL },
  }
}

export default function Done({ targetOrigin, repositoryId, nodeId }: Props) {
  useEffect(() => {
    parent.postMessage({ repositoryId, nodeId }, targetOrigin)
  }, [repositoryId, nodeId, targetOrigin])

  return null
}

interface Props extends EdusharingAsset {
  targetOrigin: string
}

export interface EdusharingAsset {
  repositoryId: string
  nodeId: string
}
