import IconText from '@frontend/src/assets-webkit/img/editor/icon-text.svg'
import IconBox from '@frontend/src/assets-webkit/img/editor/icon-box.svg'
import IconEquation from '@frontend/src/assets-webkit/img/editor/icon-equation.svg'
import IconFallback from '@frontend/src/assets-webkit/img/editor/icon-fallback.svg'
import IconGeogebra from '@frontend/src/assets-webkit/img/editor/icon-geogebra.svg'
import IconHighlight from '@frontend/src/assets-webkit/img/editor/icon-highlight.svg'
import IconImage from '@frontend/src/assets-webkit/img/editor/icon-image.svg'
import IconInjection from '@frontend/src/assets-webkit/img/editor/icon-injection.svg'
import IconMultimedia from '@frontend/src/assets-webkit/img/editor/icon-multimedia.svg'
import IconSpoiler from '@frontend/src/assets-webkit/img/editor/icon-spoiler.svg'
import IconTable from '@frontend/src/assets-webkit/img/editor/icon-table.svg'
import { RegistryPlugin } from '@/serlo-editor/plugins/rows'

export const registry: RegistryPlugin[] = [
  {
    name: 'text',
    title: 'Text',
    description: 'Schreibe Text und Matheformeln, und formatiere sie.',
    icon: <IconText />,
  },
  {
    name: 'box',
    title: 'Box',
    description: 'Rahmen für deine Beispiele, Zitate, Warnungen, Beweise, …',
    icon: <IconBox />,
  },
  {
    name: 'edusharingAsset',
    title: 'Edusharing Inhalte',
    description: 'Inhalte von edu-sharing einbinden',
    icon: <IconImage />, // Used image icon here because it is not used elsewhere
  },
  {
    name: 'equations',
    title: 'Terme und Gleichungen',
    description: 'Termumformungen und mehrzeilige Gleichungen',
    icon: <IconEquation />,
  },
  {
    name: 'geogebra',
    title: 'GeoGebra Applet',
    description: 'Inhalte von GeoGebra einbinden',
    icon: <IconGeogebra />,
  },
  {
    name: 'highlight',
    title: 'Quelltext',
    description: 'Code mit Syntax-Highlighting',
    icon: <IconHighlight />,
  },
  {
    name: 'serloInjection',
    title: 'serlo.org Inhalt',
    description: 'Inhalte von serlo.org einbinden',
    icon: <IconInjection />,
  },
  {
    name: 'multimediaExplanation',
    title: 'Erklärung mit Multimedia-Inhalt',
    description: 'Multimedia-Inhalt mit zugehöriger Erklärung',
    icon: <IconMultimedia />,
  },
  {
    name: 'spoiler',
    title: 'Spoiler',
    description: 'Ausklappbare Box (z.B. für Exkurse)',
    icon: <IconSpoiler />,
  },
  {
    name: 'serloTable',
    title: 'Tabelle',
    description: 'Schöne Tabellen erstellen.',
    icon: <IconTable />,
  },
  {
    name: 'inputExercise',
    title: 'Aufgabe mit Eingabefeld',
    description: 'Interaktive Aufgabe mit Eingabefeld (Text oder Zahlen)',
    icon: <IconFallback />, // Use fallback because could not find icon for exercises on serlo.org
  },
  {
    name: 'scMcExercise',
    title: 'Multiple-Choice-Aufgabe',
    description:
      'Interaktive Multiple-Choice-Aufgabe (eine oder mehrere richtige Antworten)',
    icon: <IconFallback />, // Use fallback because could not find icon for exercises on serlo.org
  },
  {
    name: 'anchor',
    title: 'Sprungmarke',
    description: 'Sprungmarke als Ziel für Anker-Links.',
    icon: <IconFallback />, // Use fallback because serlo.org also used fallback
  },
]
