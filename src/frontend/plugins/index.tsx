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
import { createBoxPlugin } from '@frontend/src/edtr-io/plugins/box'

import {
  EdusharingConfig,
  createEdusharingAssetPlugin,
} from './edusharing-asset'
import { equationsPlugin } from '@frontend/src/edtr-io/plugins/equations'
import { serloTablePlugin } from '@frontend/src/edtr-io/plugins/serlo-table'
import { registry, getPluginRegistry } from './registry'
import {
  loggedInData,
} from '@frontend/src/data/de'

export function createPlugins(config: EdusharingConfig) {
  return {
    anchor: createAnchorPlugin({
      i18n: { label: 'ID des Ankers', placeholder: 'aufgabe' },
    }),
    box: createBoxPlugin(loggedInData.strings.editor),
    edusharingAsset: createEdusharingAssetPlugin(config),
    equations: equationsPlugin,
    geogebra: createGeogebraPlugin({ i18n: { label: 'Geogebra URL oder ID' } }),
    highlight: createHighlightPlugin({
      i18n: {
        code: {
          label: 'Hier klicken und Quelltext eingeben…',
          placeholder:
            'Füge hier deinen Quellcode ein. Verlasse den Bereich, um eine Vorschau zu sehen.',
        },
        language: {
          label: 'Programmiersprache',
          placeholder: 'java',
        },
        showLineNumbers: {
          label: 'Zeilennummern anzeigen',
        },
      },
    }),
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
      i18n: {
        reset: 'Multimedia Inhalt zurücksetzen',
        changeMultimediaType: 'Art des Multimedia Inhalts ändern',
        illustrating: {
          label: 'Wie wichtig ist der Multimedia Inhalt?',
          values: {
            illustrating: 'Es ist eine Illustration',
            explaining: 'Es ist essentiell',
          },
        },
      },
    }),
    rows: createRowsPlugin({
      content: { plugin: 'text' },
      plugins: registry,
      i18n: {
        menu: {
          searchPlaceholder: 'Inhaltstyp suchen…',
        },
        settings: {
          duplicateLabel: 'Duplizieren',
          removeLabel: 'Löschen',
          closeLabel: 'Schließen',
        },
        toolbar: {
          dragLabel: 'Inhalt an andere Position verschieben',
        },
        addLabel: 'Neuen Inhalt hinzufügen',
      },
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
      i18n: { title: { placeholder: 'Spoiler-Titel eingeben…' } },
    }),
    text: createTextPlugin({
      placeholder: 'Gebe Text ein oder füge neue Inhalte mit \u2295 hinzu.',
      i18n: {
        code: {
          toggleTitle: 'Code',
        },
        colors: {
          setColorTitle: 'Farbe ändern',
          resetColorTitle: 'Farbe zurücksetzen',
          openMenuTitle: 'Farben',
          closeMenuTitle: 'Untermenü schließen',
        },
        headings: {
          setHeadingTitle(level: number) {
            return `Überschrift der Ebene ${level}`
          },
          openMenuTitle: 'Überschriften',
          closeMenuTitle: 'Untermenü schließen',
        },
        link: {
          toggleTitle: 'Link (Strg + K)',
          placeholder: 'URL eingeben…',
          openInNewTabTitle: 'In neuem Tab öffnen',
        },
        list: {
          toggleOrderedList: 'Geordnete Liste',
          toggleUnorderedList: 'Ungeordnete Liste',
          openMenuTitle: 'Listen',
          closeMenuTitle: 'Untermenü schließen',
        },
        math: {
          toggleTitle: 'Matheformel (Strg + M)',
          displayBlockLabel: 'Im Blockmodus darstellen',
          placeholder: '[Formel]',
          editors: {
            visual: 'visueller Modus',
            latex: 'LaTeX',
            noVisualEditorAvailableMessage: 'Nur im LaTeX-Modus verfügbar',
          },
          helpText(
            KeySpan: React.ComponentType<{ children: React.ReactNode }>
          ) {
            return (
              <>
                Tastaturkürzel:
                <br />
                <br />
                <p>
                  Brüche: <KeySpan>/</KeySpan>
                </p>
                <p>
                  Superscript: <KeySpan>↑</KeySpan> or <KeySpan>^</KeySpan>
                </p>
                <p>
                  Subscript: <KeySpan>↓</KeySpan> oder <KeySpan>_</KeySpan>
                </p>
                <p>
                  π, α, β, γ: <KeySpan>pi</KeySpan>, <KeySpan>alpha</KeySpan>,{' '}
                  <KeySpan>beta</KeySpan>,<KeySpan>gamma</KeySpan>
                </p>
                <p>
                  ≤, ≥: <KeySpan>{'<='}</KeySpan>, <KeySpan>{'>='}</KeySpan>
                </p>
                <p>
                  Wurzel: <KeySpan>\sqrt</KeySpan>, <KeySpan>\nthroot</KeySpan>
                </p>
                <p>
                  Symbole: <KeySpan>{'\\<NAME>'}</KeySpan>, e.g.{' '}
                  <KeySpan>\neq</KeySpan> (≠), <KeySpan>\pm</KeySpan> (±), ...
                </p>
                <p>
                  Funktionen: <KeySpan>sin</KeySpan>, <KeySpan>cos</KeySpan>,{' '}
                  <KeySpan>ln</KeySpan>, ...
                </p>
              </>
            )
          },
        },
        richText: {
          toggleStrongTitle: 'Fett (Strg + B)',
          toggleEmphasizeTitle: 'Kursiv (Strg + I)',
        },
        suggestions: {
          noResultsMessage: 'Keine Ergebnisse gefunden',
        },
      },
    }),
  }
}
