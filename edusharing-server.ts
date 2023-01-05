import { loadEnvConfig } from './src/server-utils'
import { EdusharingServer } from './src/edusharing-server-mock'

loadEnvConfig()

const edusharingPort = 8100
const edusharingServer = new EdusharingServer()

edusharingServer.listen(edusharingPort, () => {
  console.log('INFO: Mocked version of edusharing is ready.')
  console.log(
    `Open http://localhost:${edusharingPort}/ to open the Serlo Editor via LTI`
  )
})