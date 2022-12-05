import express from 'express'

const app = express()

app.get('/', (_req, res) => {
  res.send('Hello world')
})

app.listen(3001, () => {
  console.log('ready')
})

export {}
