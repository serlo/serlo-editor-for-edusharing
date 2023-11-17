import dynamic from 'next/dynamic'
import { ComponentProps } from 'react'

import { Link } from '@/components/content/link'
import {
  InitRenderersArgs,
  LinkRenderer,
} from '@/serlo-editor/plugin/helpers/editor-renderer'
import { BoxStaticRenderer } from '@/serlo-editor/plugins/box/static'
import { RowsStaticRenderer } from '@/serlo-editor/plugins/rows/static'
import { SpoilerStaticRenderer } from '@/serlo-editor/plugins/spoiler/static'
import type { MathElement } from '@/serlo-editor/plugins/text'
import { TextStaticRenderer } from '@/serlo-editor/plugins/text/static'
import type {
  EditorFillInTheBlanksExerciseDocument,
  EditorHighlightDocument,
  EditorInputExerciseDocument,
  EditorScMcExerciseDocument,
  EditorSerloTableDocument,
  EditorSpoilerDocument,
  EditorEquationsDocument,
  EditorGeogebraDocument,
  EditorMultimediaDocument,
  EditorExerciseDocument,
  EditorSolutionDocument,
} from '@/serlo-editor-integration/types/editor-plugins'
import { MultimediaStaticRenderer } from '@/serlo-editor/plugins/multimedia/static'
import { GeogebraStaticRenderer } from '@/serlo-editor/plugins/geogebra/static'
import { EditorPluginType } from '@/serlo-editor-integration/types/editor-plugin-type'
import { EditorSerloInjectionDocument } from './types/editor-plugins'
import { InputExerciseStaticRenderer } from '@/serlo-editor/plugins/input-exercise/static'
import { ScMcExerciseStaticRenderer } from '@/serlo-editor/plugins/sc-mc-exercise/static'
import { ExerciseStaticRenderer } from '@/serlo-editor/plugins/exercise/static'
import { StaticSolutionRenderer } from '@/serlo-editor/plugins/solution/static'
import { EdusharingAssetStaticRenderer } from './edusharing-asset/static'
import { SerloInjectionStaticRenderer } from './serlo-injection/static'

const EquationsStaticRenderer = dynamic<EditorEquationsDocument>(() =>
  import('@/serlo-editor/plugins/equations/static').then(
    (mod) => mod.EquationsStaticRenderer,
  ),
)
const FillInTheBlanksStaticRenderer =
  dynamic<EditorFillInTheBlanksExerciseDocument>(() =>
    import('@/serlo-editor/plugins/fill-in-the-blanks-exercise/static').then(
      (mod) => mod.FillInTheBlanksStaticRenderer,
    ),
  )
const SerloTableStaticRenderer = dynamic<EditorSerloTableDocument>(() =>
  import('@/serlo-editor/plugins/serlo-table/static').then(
    (mod) => mod.SerloTableStaticRenderer,
  ),
)
const HighlightStaticRenderer = dynamic<EditorHighlightDocument>(() =>
  import('@/serlo-editor/plugins/highlight/static').then(
    (mod) => mod.HighlightStaticRenderer,
  ),
)
const StaticMath = dynamic<MathElement>(() =>
  import('@/serlo-editor/plugins/text/static-components/static-math').then(
    (mod) => mod.StaticMath,
  ),
)

export function createRenderers(): InitRenderersArgs {
  return {
    pluginRenderers: [
      // edu-sharing specific
      { type: 'edusharingAsset', renderer: EdusharingAssetStaticRenderer },
      {
        type: 'serloInjection',
        renderer: SerloInjectionStaticRenderer,
      },

      // plugins
      { type: EditorPluginType.Rows, renderer: RowsStaticRenderer },
      { type: EditorPluginType.Text, renderer: TextStaticRenderer },
      {
        type: EditorPluginType.Multimedia,
        renderer: (state: EditorMultimediaDocument) => {
          return <MultimediaStaticRenderer {...state} />
        },
      },
      {
        type: EditorPluginType.Spoiler,
        renderer: (state: EditorSpoilerDocument) => {
          return <SpoilerStaticRenderer {...state} />
        },
      },
      { type: EditorPluginType.Box, renderer: BoxStaticRenderer },
      { type: EditorPluginType.SerloTable, renderer: SerloTableStaticRenderer },
      { type: EditorPluginType.Equations, renderer: EquationsStaticRenderer },
      {
        type: EditorPluginType.Geogebra,
        renderer: (props: EditorGeogebraDocument) => {
          return <GeogebraStaticRenderer {...props} />
        },
      },

      // exercises
      {
        type: EditorPluginType.Exercise,
        renderer: (props: EditorExerciseDocument) => {
          return <ExerciseStaticRenderer {...props} />
        },
      },
      {
        type: EditorPluginType.Highlight,
        renderer: (props: EditorHighlightDocument) => {
          return <HighlightStaticRenderer {...props} />
        },
      },
      {
        type: EditorPluginType.InputExercise,
        renderer: (props: EditorInputExerciseDocument) => {
          return <InputExerciseStaticRenderer {...props} />
        },
      },
      {
        type: EditorPluginType.ScMcExercise,
        renderer: (props: EditorScMcExerciseDocument) => {
          // @@@ Do these extra properties have to be mandatory?
          return (
            <ScMcExerciseStaticRenderer
              {...props}
              idBase="temp"
              onEvaluate={() => {}}
              renderExtraAnswerContent={() => <></>}
            />
          )
        },
      },

      {
        type: EditorPluginType.FillInTheBlanksExercise,
        renderer: FillInTheBlanksStaticRenderer,
      },
      {
        type: EditorPluginType.Solution,
        renderer: (props: EditorSolutionDocument) => {
          return (
            <StaticSolutionRenderer {...props} solutionVisibleOnInit={false} />
          )
        },
      },

      {
        type: EditorPluginType.Unsupported,
        renderer: (state: unknown) => {
          // eslint-disable-next-line no-console
          console.warn('unsupported renderer: ', state)
          return null
        },
      },
    ],
    mathRenderer: (element: MathElement) => <StaticMath {...element} />,
    linkRenderer: ({ href, children }: ComponentProps<LinkRenderer>) => {
      return (
        <>
          <Link href={href}>{children}</Link>
        </>
      )
    },
  }
}
