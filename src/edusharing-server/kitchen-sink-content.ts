export const kitchenSinkContent = {
  type: 'https://serlo.org/editor',
  variant: 'https://github.com/serlo/serlo-editor-for-edusharing',
  version: 0,
  dateModified: '2024-09-02T07:34:15.025Z',
  document: {
    plugin: 'type-generic-content',
    state: {
      content: {
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
                  { text: 'formatierte ', strong: true },
                  { text: 'Texte', em: true },
                  { text: ' mit ' },
                  {
                    type: 'a',
                    href: 'https://example.com/',
                    children: [{ text: 'Links' }],
                  },
                  { text: ', Formeln ' },
                  {
                    type: 'math',
                    src: 'x^{2}=1',
                    inline: true,
                    children: [{ text: '' }],
                  },
                  { text: ', Code ' },
                  { text: 'const value = 1', code: true },
                  { text: ' usw.' },
                ],
              },
              { type: 'p', children: [{ text: 'Auch Listen wie ...' }] },
              {
                children: [
                  {
                    children: [
                      {
                        type: 'list-item-child',
                        children: [{ text: 'Eins ' }],
                      },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      { children: [{ text: 'Zwei' }], type: 'list-item-child' },
                    ],
                    type: 'list-item',
                  },
                ],
                type: 'ordered-list',
              },
              { children: [{ text: 'oder' }], type: 'p' },
              {
                children: [
                  {
                    children: [
                      { type: 'list-item-child', children: [{ text: 'Eins' }] },
                    ],
                    type: 'list-item',
                  },
                  {
                    children: [
                      {
                        children: [{ text: 'Zwei ' }],
                        type: 'list-item-child',
                      },
                    ],
                    type: 'list-item',
                  },
                ],
                type: 'unordered-list',
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
                    state: [
                      { type: 'p', children: [{ text: 'Spoilerinhalt' }] },
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
                children: [{ text: 'Tabellen' }],
              },
            ],
          },
          {
            plugin: 'serloTable',
            state: {
              rows: [
                {
                  columns: [
                    {
                      content: {
                        plugin: 'text',
                        state: [{ type: 'p', children: [{ text: 'A' }] }],
                      },
                    },
                    {
                      content: {
                        plugin: 'text',
                        state: [{ type: 'p', children: [{ text: 'B' }] }],
                      },
                    },
                  ],
                },
                {
                  columns: [
                    {
                      content: {
                        plugin: 'text',
                        state: [{ type: 'p', children: [{ text: '1' }] }],
                      },
                    },
                    {
                      content: {
                        plugin: 'text',
                        state: [{ type: 'p', children: [{ text: '2' }] }],
                      },
                    },
                  ],
                },
              ],
              tableType: 'OnlyColumnHeader',
            },
          },
          {
            plugin: 'text',
            state: [
              {
                type: 'h',
                level: 2,
                children: [{ text: 'Terme und Gleichungen' }],
              },
            ],
          },
          {
            plugin: 'equations',
            state: {
              steps: [
                {
                  left: 'x\\ -1',
                  sign: 'equals',
                  right: '9',
                  transform: '+1',
                  explanation: {
                    plugin: 'text',
                    state: [
                      { type: 'p', children: [{ text: 'Beide Seiten + 1' }] },
                    ],
                  },
                },
                {
                  left: 'x',
                  sign: 'equals',
                  right: '10',
                  transform: '',
                  explanation: {
                    plugin: 'text',
                    state: [{ type: 'p', children: [{ text: '' }] }],
                  },
                },
              ],
              firstExplanation: {
                plugin: 'text',
                state: [{ type: 'p', children: [{ text: 'Gleichung' }] }],
              },
              transformationTarget: 'equation',
            },
          },
          {
            plugin: 'text',
            state: [
              {
                type: 'h',
                level: 2,
                children: [{ text: 'Geogebra' }],
              },
            ],
          },
          { plugin: 'geogebra', state: 'nv5wNx9R' },
          {
            plugin: 'text',
            state: [
              {
                type: 'h',
                level: 2,
                children: [{ text: 'Interaktive Aufgaben' }],
              },
            ],
          },
          {
            plugin: 'exercise',
            state: {
              content: {
                plugin: 'rows',
                state: [
                  {
                    plugin: 'text',
                    state: [
                      { type: 'p', children: [{ text: 'Auswahlaufgabe' }] },
                    ],
                  },
                ],
              },
              interactive: {
                plugin: 'scMcExercise',
                state: {
                  isSingleChoice: false,
                  answers: [
                    {
                      content: {
                        plugin: 'text',
                        state: [{ type: 'p', children: [{ text: 'A' }] }],
                      },
                      isCorrect: true,
                      feedback: {
                        plugin: 'text',
                        state: [{ type: 'p', children: [{ text: '' }] }],
                      },
                    },
                    {
                      content: {
                        plugin: 'text',
                        state: [{ type: 'p', children: [{ text: 'B' }] }],
                      },
                      isCorrect: false,
                      feedback: {
                        plugin: 'text',
                        state: [{ type: 'p', children: [{ text: '' }] }],
                      },
                    },
                  ],
                },
              },
            },
          },
          {
            plugin: 'exercise',
            state: {
              content: {
                plugin: 'rows',
                state: [
                  {
                    plugin: 'text',
                    state: [
                      {
                        type: 'p',
                        children: [{ text: 'Eingabefeld Aufgabe' }],
                      },
                    ],
                  },
                ],
              },
              interactive: {
                plugin: 'inputExercise',
                state: {
                  type: 'input-string-normalized-match-challenge',
                  unit: '',
                  answers: [
                    {
                      value: 'A',
                      isCorrect: true,
                      feedback: {
                        plugin: 'text',
                        state: [{ type: 'p', children: [{ text: '' }] }],
                      },
                    },
                  ],
                },
              },
            },
          },
          {
            plugin: 'exercise',
            state: {
              content: {
                plugin: 'rows',
                state: [
                  {
                    plugin: 'text',
                    state: [
                      { type: 'p', children: [{ text: 'Freitext Aufgabe' }] },
                    ],
                  },
                ],
              },
              interactive: {
                plugin: 'textAreaExercise',
                state: {},
              },
            },
          },
          {
            plugin: 'exercise',
            state: {
              content: {
                plugin: 'rows',
                state: [
                  {
                    plugin: 'text',
                    state: [
                      { type: 'p', children: [{ text: 'Lückentext Aufgabe' }] },
                    ],
                  },
                ],
              },
              interactive: {
                plugin: 'blanksExercise',
                state: {
                  extraDraggableAnswers: [
                    {
                      answer: 'neun',
                    },
                  ],
                  mode: 'drag-and-drop',
                  text: {
                    plugin: 'text',
                    state: [
                      {
                        type: 'p',
                        children: [
                          {
                            text: 'eins ',
                          },
                          {
                            type: 'textBlank',
                            blankId: '64c5d680-a8da-40db-99f1-ea342e08a892',
                            acceptMathEquivalents: true,
                            correctAnswers: [
                              { answer: 'zwei' },
                              { answer: 'Zwei' },
                            ],
                            children: [{ text: '' }],
                          },
                          {
                            text: ' drei',
                          },
                        ],
                      },
                    ],
                  },
                },
              },
              solution: {
                plugin: 'solution',
                state: {
                  steps: {
                    plugin: 'rows',
                    state: [
                      {
                        plugin: 'text',
                        state: [{ type: 'p', children: [{ text: 'Lösung' }] }],
                      },
                    ],
                  },
                  strategy: {
                    plugin: 'rows',
                    state: [
                      {
                        plugin: 'text',
                        state: [
                          { type: 'p', children: [{ text: 'Strategie' }] },
                        ],
                      },
                    ],
                  },
                },
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
        ],
      },
    },
  },
}
