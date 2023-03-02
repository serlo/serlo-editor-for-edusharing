import { Server } from 'http'
import express from 'express'

let server: Server

beforeAll((done) => {
  global.edusharing = express()

  server = global.edusharing.listen(8100, done)
})

afterAll((done) => {
  server.close(done)
})

declare global {
  var edusharing: ReturnType<typeof express>
}
