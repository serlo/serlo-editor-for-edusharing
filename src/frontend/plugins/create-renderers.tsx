import {
  createRenderers as createBasicRenderers,
  // SpoilerStaticRenderer,
  // type EditorHighlightDocument,
  // type EditorInputExerciseDocument,
  // type EditorScMcExerciseDocument,
  // type EditorSerloTableDocument,
  // type EditorSpoilerDocument,
  // type EditorEquationsDocument,
  // type EditorMultimediaDocument,
  // type EditorExerciseDocument,
  // type EditorSolutionDocument,
  EditorPluginType,
  //   MultimediaStaticRenderer,
  //   InputExerciseStaticRenderer,
  // ScMcExerciseStaticRenderer,
  // ExerciseStaticRenderer,
  // StaticSolutionRenderer,
} from '@serlo/editor'

import { EdusharingAssetStaticRenderer } from './edusharing-asset/static'
import { SerloInjectionStaticRenderer } from './serlo-injection/static'

export function createRenderers(): ReturnType<typeof createBasicRenderers> {
  const { pluginRenderers, ...otherRenderers } = createBasicRenderers()

  return {
    pluginRenderers: [
      // edu-sharing specific
      { type: 'edusharingAsset', renderer: EdusharingAssetStaticRenderer },
      {
        type: 'serloInjection',
        renderer: SerloInjectionStaticRenderer,
      },
      ...pluginRenderers,
    ],
    ...otherRenderers,
  }
}
