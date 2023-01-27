import { createAnchorPlugin } from '@edtr-io/plugin-anchor'
import { createGeogebraPlugin } from '@edtr-io/plugin-geogebra'
import { createHighlightPlugin } from '@edtr-io/plugin-highlight'
import {
  createInputExercisePlugin,
  InputExerciseType,
} from '@edtr-io/plugin-input-exercise'
import { createMultimediaExplanationPlugin } from '@edtr-io/plugin-multimedia-explanation'
import { createRowsPlugin } from '@edtr-io/plugin-rows'
import { createScMcExercisePlugin } from '@edtr-io/plugin-sc-mc-exercise'
import { createSerloInjectionPlugin } from '@edtr-io/plugin-serlo-injection'
import { createSpoilerPlugin } from '@edtr-io/plugin-spoiler'
import { createTextPlugin } from '@edtr-io/plugin-text'
import { createBoxPlugin } from './box'

import {
  EdusharingConfig,
  createEdusharingAssetPlugin,
} from './edusharing-asset'
import { equationsPlugin } from './equations'
import { serloTablePlugin } from './serlo-table'
import { registry, getPluginRegistry } from './registry'

export function createPlugins(config: EdusharingConfig) {
  return {
    anchor: createAnchorPlugin({
      i18n: { label: 'ID des Ankers', placeholder: 'aufgabe' },
    }),
    box: createBoxPlugin(),
    edusharingAsset: createEdusharingAssetPlugin(config),
    equations: equationsPlugin,
    geogebra: createGeogebraPlugin({ i18n: { label: 'Geogebra URL oder ID' } }),
    highlight: createHighlightPlugin(),
    inputExercise: createInputExercisePlugin({
      feedback: { plugin: 'text', config: { registry: [] } },
      i18n: {
        types: {
          [InputExerciseType.InputStringNormalizedMatchChallenge]: 'Text',
          [InputExerciseType.InputNumberExactMatchChallenge]: 'Zahl',
          [InputExerciseType.InputExpressionEqualMatchChallenge]:
            'Mathematischer Ausdruck',
        },
        type: { label: 'Wähle einen Aufgabentyp' },
        unit: { label: 'Einheit' },
        answer: {
          label: 'Antwort',
          addLabel: 'Antwort hinzufügen',
          value: { placeholder: 'Trage einen Wert ein' },
        },
        feedback: { label: 'Feedback' },
        inputPlaceholder: 'Deine Lösung',
        fallbackFeedback: { correct: 'Korrekt!', wrong: 'Leider falsch' },
      },
    }),
    multimediaExplanation: createMultimediaExplanationPlugin({
      explanation: { plugin: 'rows' },
      plugins: getPluginRegistry(['geogebra', 'edusharingAsset']),
    }),
    rows: createRowsPlugin({
      content: { plugin: 'text' },
      plugins: registry,
    }),
    scMcExercise: createScMcExercisePlugin({
      content: { plugin: 'text', config: { registry: [] } },
      feedback: { plugin: 'text', config: { registry: [] } },
      i18n: {
        types: {
          singleChoice: 'Single Choice',
          multipleChoice: 'Multiple Choice',
        },
        answer: {
          label: 'Antwort',
          addLabel: 'Antwort hinzufügen',
          fallbackFeedback: { wrong: 'Falsch' },
        },
        feedback: { label: 'Feedback' },
        globalFeedback: {
          missingCorrectAnswers:
            'Fast! Dir fehlt mindestens eine richtige Antwort',
          correct: 'Korrekt!',
          wrong: 'Leider falsch',
        },
        isSingleChoice: { label: 'Wähle den Aufgabentyp aus' },
      },
    }),
    serloTable: serloTablePlugin,
    serloInjection: createSerloInjectionPlugin(),
    spoiler: createSpoilerPlugin({
      content: { plugin: 'rows' },
    }),
    text: createTextPlugin({
      registry,
    }),
  }
}
