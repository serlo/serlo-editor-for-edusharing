// import dynamic from 'next/dynamic'
import { ComponentProps } from 'react'

import { Link } from '../link'
import {
  type InitRenderersArgs,
  type LinkRenderer,
  BoxStaticRenderer,
  RowsStaticRenderer,
  // SpoilerStaticRenderer,
  MathElement,
  TextStaticRenderer,
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
SerloTableStaticRenderer,
StaticMath,
} from '@serlo/editor'

import { EdusharingAssetStaticRenderer } from './edusharing-asset/static'
import { SerloInjectionStaticRenderer } from './serlo-injection/static'

// const EquationsStaticRenderer = dynamic<EditorEquationsDocument>(() =>
//   import('@serlo/editor/serlo-editor/plugins/equations/static').then(
//     (mod) => mod.EquationsStaticRenderer,
//   ),
// )
// const FillInTheBlanksStaticRenderer =
//   dynamic<EditorFillInTheBlanksExerciseDocument>(() =>
//     import('@/serlo-editor/plugins/fill-in-the-blanks-exercise/static').then(
//       (mod) => mod.FillInTheBlanksStaticRenderer,
//     ),
//   )

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
      // {
      //   type: EditorPluginType.Multimedia,
      //   renderer: (state: EditorMultimediaDocument) => {
      //     return <MultimediaStaticRenderer {...state} />
      //   },
      // },
      // {
      //   type: EditorPluginType.Spoiler,
      //   renderer: (state: EditorSpoilerDocument) => {
      //     return <SpoilerStaticRenderer {...state} />
      //   },
      // },
      { type: EditorPluginType.Box, renderer: BoxStaticRenderer },
      { type: EditorPluginType.SerloTable, renderer: SerloTableStaticRenderer },
      // { type: EditorPluginType.Equations, renderer: EquationsStaticRenderer },
      // Deactivated because geogebra embeds don't size themselves correctly in static renderer view. Having a relative div around GeogebraStaticRenderer already improved it (probably because of the absolute positioned child element). But now the geogebra applet has a height of 0, does not resize itself correctly to the space available. Specifying a height in the container div is not an option because applets have different heights.
      // TODO: Fix issue with geogebra static renderer view and reenable
      // {
      //   type: EditorPluginType.Geogebra,
      //   renderer: (props: EditorGeogebraDocument) => {
      //     return (
      //       <div className="relative">
      //         <GeogebraStaticRenderer {...props} />
      //       </div>
      //     )
      //   },
      // },

      // exercises
      // {
      //   type: EditorPluginType.Exercise,
      //   renderer: (props: EditorExerciseDocument) => {
      //     return <ExerciseStaticRenderer {...props} />
      //   },
      // },
      // {
      //   type: EditorPluginType.Highlight,
      //   renderer: (props: EditorHighlightDocument) => {
      //     return <HighlightStaticRenderer {...props} />
      //   },
      // },
      // {
      //   type: EditorPluginType.InputExercise,
      //   renderer: (props: EditorInputExerciseDocument) => {
      //     return <InputExerciseStaticRenderer {...props} />
      //   },
      // },
      // {
      //   type: EditorPluginType.ScMcExercise,
      //   renderer: (props: EditorScMcExerciseDocument) => {
      //     // @@@ Do these extra properties have to be mandatory?
      //     return (
      //       <ScMcExerciseStaticRenderer
      //         {...props}
      //         idBase="temp"
      //         onEvaluate={() => {}}
      //         renderExtraAnswerContent={() => <></>}
      //       />
      //     )
      //   },
      // },
      // {
      //   type: EditorPluginType.FillInTheBlanksExercise,
      //   renderer: FillInTheBlanksStaticRenderer,
      // },
      // {
      //   type: EditorPluginType.Solution,
      //   renderer: (props: EditorSolutionDocument) => {
      //     return (
      //       <StaticSolutionRenderer {...props} solutionVisibleOnInit={false} />
      //     )
      //   },
      // },

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
