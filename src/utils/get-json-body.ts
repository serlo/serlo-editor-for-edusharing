import bodyParser from 'body-parser'
import { GetServerSidePropsContext } from 'next'

const jsonParser = bodyParser.json()

export async function getJsonBody<T = unknown>({
  req,
  res,
}: GetServerSidePropsContext) {
  return new Promise((resolve) => {
    jsonParser(req, res, () => {
      resolve((req as unknown as { body: T }).body)
    })
  })
}
