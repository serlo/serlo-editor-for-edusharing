export const kitchenSink = {
  plugin: 'rows',
  state: [
    {
      plugin: 'text',
      state: [
        {
          type: 'h',
          level: 1,
          children: [{ text: 'Pluginübersicht' }],
        },
      ],
    },
    {
      plugin: 'text',
      state: [
        {
          type: 'h',
          level: 2,
          children: [{ text: 'Rich Text' }],
        },
      ],
    },
    {
      plugin: 'text',
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
      plugin: 'text',
      state: [
        {
          type: 'h',
          level: 2,
          children: [{ text: 'Multimedia-Inhalt' }],
        },
      ],
    },
    {
      plugin: 'multimedia',
      state: {
        explanation: {
          plugin: 'rows',
          state: [
            {
              plugin: 'text',
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
      plugin: 'text',
      state: [
        {
          type: 'h',
          level: 2,
          children: [{ text: 'Quelltext' }],
        },
      ],
    },
    {
      plugin: 'highlight',
      state: {
        code: "console.log('Hallo Welt!')",
        language: 'javascript',
      },
    },
    {
      plugin: 'text',
      state: [
        {
          type: 'h',
          level: 2,
          children: [{ text: 'Zitat' }],
        },
      ],
    },
    {
      plugin: 'box',
      state: {
        type: 'quote',
        title: {
          plugin: 'text',
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
          plugin: 'rows',
          state: [
            {
              plugin: 'text',
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
      plugin: 'text',
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
      plugin: 'text',
      state: [
        {
          type: 'h',
          level: 2,
          children: [{ text: 'Spoiler' }],
        },
      ],
    },
    {
      plugin: 'spoiler',
      state: {
        title: 'Spoilertitel',
        content: {
          plugin: 'rows',
          state: [
            {
              plugin: 'text',
              state: [{ type: 'p', children: [{ text: 'Inhalte' }] }],
            },
          ],
        },
      },
    },
    {
      plugin: 'text',
      state: [
        {
          type: 'h',
          level: 2,
          children: [{ text: 'Aufgabe mit Eingabefeld' }],
        },
      ],
    },
    {
      plugin: 'text',
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
      plugin: 'inputExercise',
      state: {
        answers: [
          {
            feedback: {
              plugin: 'text',
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
      plugin: 'text',
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
      plugin: 'text',
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
      plugin: 'scMcExercise',
      state: {
        answers: [
          {
            content: {
              plugin: 'text',
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
              plugin: 'text',
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
              plugin: 'text',
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
              plugin: 'text',
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
