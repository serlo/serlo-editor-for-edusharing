import {
  createIcon,
  faAnchor,
  faCaretSquareDown,
  faCode,
  faCubes,
  faEquals,
  faNewspaper,
  faParagraph,
  faPhotoVideo,
  faTable,
} from '@edtr-io/ui'
import {
  faPuzzlePiece,
  faVectorSquare,
} from '@fortawesome/free-solid-svg-icons'

export const registry = [
  {
    name: 'text',
    title: 'Text',
    description: 'Schreibe Text und Matheformeln, und formatiere sie.',
    icon: createIcon(faParagraph),
  },
  {
    name: 'box',
    title: 'Box',
    description: 'Rahmen für deine Beispiele, Zitate, Warnungen, Beweise, …',
    icon: createIcon(faVectorSquare),
  },
  {
    name: 'edusharingAsset',
    title: 'Edusharing Inhalte',
    description: 'Inhalte von edu-sharing einbinden',
    icon: createIcon(faCubes),
  },
  {
    name: 'equations',
    title: 'Terme und Gleichungen',
    description: 'Termumformungen und mehrzeilige Gleichungen',
    icon: createIcon(faEquals),
  },
  {
    name: 'geogebra',
    title: 'GeoGebra Applet',
    description: 'Inhalte von GeoGebra einbinden',
    icon: createIcon(faCubes),
  },
  {
    name: 'highlight',
    title: 'Quelltext',
    description: 'Code mit Syntax-Highlighting',
    icon: createIcon(faCode),
  },
  {
    name: 'serloInjection',
    title: 'serlo.org Inhalt',
    description: 'Inhalte von serlo.org einbinden',
    icon: createIcon(faNewspaper),
  },
  {
    name: 'multimediaExplanation',
    title: 'Erklärung mit Multimedia-Inhalt',
    description: 'Multimedia-Inhalt mit zugehöriger Erklärung',
    icon: createIcon(faPhotoVideo),
  },
  {
    name: 'spoiler',
    title: 'Spoiler',
    description: 'Ausklappbare Box (z.B. für Exkurse)',
    icon: createIcon(faCaretSquareDown),
  },
  {
    name: 'serloTable',
    title: 'Tabelle',
    description: 'Schöne Tabellen erstellen.',
    icon: createIcon(faTable),
  },
  {
    name: 'inputExercise',
    title: 'Aufgabe mit Eingabefeld',
    description: 'Interaktive Aufgabe mit Eingabefeld (Text oder Zahlen)',
    icon: createIcon(faPuzzlePiece),
  },
  {
    name: 'scMcExercise',
    title: 'Multiple-Choice-Aufgabe',
    description:
      'Interaktive Multiple-Choice-Aufgabe (eine oder mehrere richtige Antworten)',
    icon: createIcon(faPuzzlePiece),
  },
  {
    name: 'anchor',
    title: 'Sprungmarke',
    description: 'Sprungmarke als Ziel für Anker-Links.',
    icon: createIcon(faAnchor),
  },
]

export function getPluginRegistry(include: string[]) {
  return registry.filter((plugin) => include.includes(plugin.name))
}
