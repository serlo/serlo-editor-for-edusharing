import { EditorPluginType } from '@frontend/src/serlo-editor-integration/types/editor-plugin-type'

export const kitchenSink = {
  plugin: EditorPluginType.Rows,
  state: [
    {
      plugin: EditorPluginType.Text,
      state: [
        {
          type: 'h',
          level: 1,
          children: [{ text: 'Pluginübersicht' }],
        },
      ],
    },
    {
      plugin: EditorPluginType.Text,
      state: [
        {
          type: 'h',
          level: 2,
          children: [{ text: 'Rich Text' }],
        },
      ],
    },
    {
      plugin: EditorPluginType.Text,
      state: [
        {
          type: 'p',
          children: [
            { text: 'Der Editor unterstützt ' },
            { text: 'formatierte Texte', strong: true },
            { text: ' with ' },
            {
              type: 'a',
              href: 'https://serlo.org',
              children: [{ text: 'links' }],
            },
            { text: ' usw.', strong: true },
          ],
        },
      ],
    },
    {
      plugin: EditorPluginType.Text,
      state: [
        {
          type: 'h',
          level: 2,
          children: [{ text: 'Multimedia-Inhalt' }],
        },
      ],
    },
    {
      plugin: EditorPluginType.Multimedia,
      state: {
        explanation: {
          plugin: EditorPluginType.Rows,
          state: [
            {
              plugin: EditorPluginType.Text,
              state: [
                {
                  type: 'p',
                  children: [{ text: 'Erklärung zum Bild' }],
                },
              ],
            },
          ],
        },
        illustrating: true,
        multimedia: {
          plugin: 'edusharingAsset',
          state: {},
        },
        width: 50,
      },
    },
    {
      plugin: EditorPluginType.Text,
      state: [
        {
          type: 'h',
          level: 2,
          children: [{ text: 'Quelltext' }],
        },
      ],
    },
    {
      plugin: EditorPluginType.Highlight,
      state: {
        code: "console.log('Hallo Welt!')",
        language: 'javascript',
      },
    },
    {
      plugin: EditorPluginType.Text,
      state: [
        {
          type: 'h',
          level: 2,
          children: [{ text: 'Zitat' }],
        },
      ],
    },
    {
      plugin: EditorPluginType.Box,
      state: {
        type: 'quote',
        title: {
          plugin: EditorPluginType.Text,
          state: [
            {
              type: 'p',
              children: [
                {
                  text: 'Sir Isaac Newton',
                },
              ],
            },
          ],
        },
        anchorId: 'box82025',
        content: {
          plugin: EditorPluginType.Rows,
          state: [
            {
              plugin: EditorPluginType.Text,
              state: [
                {
                  type: 'p',
                  children: [
                    {
                      text: 'Was wir wissen, ist ein Tropfen, was wir nicht wissen, ein Ozean.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    {
      plugin: EditorPluginType.Text,
      state: [
        {
          type: 'h',
          level: 2,
          children: [{ text: 'Serlo Injection' }],
        },
      ],
    },
    {
      plugin: 'serloInjection',
      state: '54210',
    },
    {
      plugin: EditorPluginType.Text,
      state: [
        {
          type: 'h',
          level: 2,
          children: [{ text: 'Spoiler' }],
        },
      ],
    },
    {
      plugin: EditorPluginType.Spoiler,
      state: {
        title: 'Spoilertitel',
        content: {
          plugin: EditorPluginType.Rows,
          state: [
            {
              plugin: EditorPluginType.Text,
              state: [{ type: 'p', children: [{ text: 'Inhalte' }] }],
            },
          ],
        },
      },
    },
    {
      plugin: EditorPluginType.Text,
      state: [
        {
          type: 'h',
          level: 2,
          children: [{ text: 'Aufgabe mit Eingabefeld' }],
        },
      ],
    },
    {
      plugin: EditorPluginType.Text,
      state: [
        {
          type: 'p',
          children: [
            {
              text: 'Was ist 1+1?',
            },
          ],
        },
      ],
    },
    {
      plugin: EditorPluginType.InputExercise,
      state: {
        answers: [
          {
            feedback: {
              plugin: EditorPluginType.Text,
              state: [
                {
                  children: [
                    {
                      text: '',
                    },
                  ],
                  type: 'p',
                },
              ],
            },
            isCorrect: true,
            value: '2',
          },
        ],
        type: 'input-number-exact-match-challenge',
        unit: '',
      },
    },
    {
      plugin: EditorPluginType.Text,
      state: [
        {
          children: [
            {
              text: 'Single / multiple choice Aufgabe',
            },
          ],
          level: 2,
          type: 'h',
        },
      ],
    },
    {
      plugin: EditorPluginType.Text,
      state: [
        {
          children: [
            {
              text: 'Wähle die richtigen Antworten aus:',
            },
          ],
          type: 'p',
        },
      ],
    },
    {
      plugin: EditorPluginType.ScMcExercise,
      state: {
        answers: [
          {
            content: {
              plugin: EditorPluginType.Text,
              state: [
                {
                  children: [
                    {
                      text: 'Antwort A',
                    },
                  ],
                  type: 'p',
                },
              ],
            },
            feedback: {
              plugin: EditorPluginType.Text,
              state: [
                {
                  children: [
                    {
                      text: '',
                    },
                  ],
                  type: 'p',
                },
              ],
            },
            isCorrect: true,
          },
          {
            content: {
              plugin: EditorPluginType.Text,
              state: [
                {
                  children: [
                    {
                      text: 'Antwort B',
                    },
                  ],
                  type: 'p',
                },
              ],
            },
            feedback: {
              plugin: EditorPluginType.Text,
              state: [
                {
                  children: [
                    {
                      text: '',
                    },
                  ],
                  type: 'p',
                },
              ],
            },
            isCorrect: false,
          },
        ],
        isSingleChoice: false,
      },
    },
  ],
}
