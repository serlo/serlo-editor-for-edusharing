import { loadEnvConfig } from '../server-utils'
import { EdusharingServer } from './server'

loadEnvConfig()

const edusharingPort = parseInt(process.env.EDUSHARING_PORT, 10) || 8100
const edusharingServer = new EdusharingServer()

edusharingServer.listen(edusharingPort, () => {
  console.log('INFO: Mocked version of edusharing is ready.')
  console.log(
    `Open http://localhost:${edusharingPort}/ to open the Serlo Editor via LTI`
  )
})
