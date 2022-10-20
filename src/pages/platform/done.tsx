import jwt from 'jsonwebtoken'
import { GetServerSideProps } from 'next'
import { parseBody } from 'next/dist/server/api-utils/node'
import { useEffect } from 'react'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const body = await parseBody(context.req, '1mb')
  const token = body.JWT

  // TODO: verify token
  const decoded = jwt.decode(token, { complete: true })

  // Test scheme
  const resourceLink =
    decoded.payload[
      'https://purl.imsglobal.org/spec/lti-dl/claim/content_items'
    ][0]['url']

  return {
    props: {
      resourceLink,
    },
  }
}

export default function Done({ resourceLink }) {
  // TODO: Set target origin
  useEffect(() => {
    parent.postMessage({ resourceLink }, '*')
  }, [resourceLink])

  return null
}
