import IconImage from '../assets/plugin-icons/icon-image.svg'
import IconInjection from '../assets/plugin-icons/icon-injection.svg'

import { createEdusharingAssetPlugin } from './edusharing-asset'
import { createSerloInjectionPlugin } from './serlo-injection'
import { EdusharingAssetStaticRenderer } from './edusharing-asset/static'
import { SerloInjectionStaticRenderer } from './serlo-injection/static'

export function createCustomPlugins({ ltik }: { ltik: string }) {
  return [
    {
      type: 'serloInjection',
      plugin: createSerloInjectionPlugin(),
      renderer: SerloInjectionStaticRenderer,
      visibleInSuggestions: true,
      icon: <IconInjection />,
    },
    {
      type: 'edusharingAsset',
      plugin: createEdusharingAssetPlugin({ ltik }),
      renderer: EdusharingAssetStaticRenderer,
      visibleInSuggestions: true,
      icon: <IconImage />,
    },
  ]
}
