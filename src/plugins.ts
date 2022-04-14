import { createTextPlugin } from '@edtr-io/plugin-text'

const textPlugin = createTextPlugin({
  placeholder: 'Hello world',
  registry: [],
})

export const plugins = {
  text: textPlugin,
}
