import dynamic from 'next/dynamic'
import { ComponentProps } from 'react'

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
  EditorHighlightDocument,
  EditorInputExerciseDocument,
  EditorScMcExerciseDocument,
  EditorSerloTableDocument,
  EditorSpoilerDocument,
  EditorEquationsDocument,
  EditorMultimediaDocument,
  EditorExerciseDocument,
  EditorSolutionDocument,
  EditorGeogebraDocument,
} from '@frontend/src/serlo-editor/types/editor-plugins'
import { MultimediaStaticRenderer } from '@/serlo-editor/plugins/multimedia/static'
import { EditorPluginType } from '@frontend/src/serlo-editor/types/editor-plugin-type'
import { InputExerciseStaticRenderer } from '@/serlo-editor/plugins/input-exercise/static'
import { ScMcExerciseStaticRenderer } from '@/serlo-editor/plugins/sc-mc-exercise/static'
import { ExerciseStaticRenderer } from '@/serlo-editor/plugins/exercise/static'
import { StaticSolutionRenderer } from '@/serlo-editor/plugins/solution/static'
import { EdusharingAssetStaticRenderer } from './edusharing-asset/static'
import { SerloInjectionStaticRenderer } from './serlo-injection/static'
import { TextAreaExerciseStaticRenderer } from '@/serlo-editor/plugins/text-area-exercise/static'
import { GeogebraStaticRenderer } from '@/serlo-editor/plugins/geogebra/static'

const EquationsStaticRenderer = dynamic<EditorEquationsDocument>(() =>
  import('@/serlo-editor/plugins/equations/static').then(
    (mod) => mod.EquationsStaticRenderer,
  ),
)
// const FillInTheBlanksStaticRenderer =
//   dynamic<EditorFillInTheBlanksExerciseDocument>(() =>
//     import('@/serlo-editor/plugins/fill-in-the-blanks-exercise/static').then(
//       (mod) => mod.FillInTheBlanksStaticRenderer,
//     ),
//   )
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
      // Geogebra embeds don't size themselves correctly in static renderer view. Having a relative div around GeogebraStaticRenderer already improved it (probably because of the absolute positioned child element). But now the geogebra applet has a height of 0, does not resize itself correctly to the space available. Specifying a height in the container div is not an option because applets have different heights.
      {
        type: EditorPluginType.Geogebra,
        renderer: (props: EditorGeogebraDocument) => {
          return (
            <div className="relative pb-[56.2%]">
              <GeogebraStaticRenderer {...props} />
            </div>
          )
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
        type: EditorPluginType.TextAreaExercise,
        renderer: TextAreaExerciseStaticRenderer,
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
      // {
      //   type: EditorPluginType.FillInTheBlanksExercise,
      //   renderer: FillInTheBlanksStaticRenderer,
      // },
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
          <a className="serlo-link" href={href}>
            {children}
          </a>
        </>
      )
    },
  }
}
