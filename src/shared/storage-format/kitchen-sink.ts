export const kitchenSink = {
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
          id: '3dde85b2-cd14-4e92-9af1-f97db5037c78',
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
          id: 'f749c104-58a8-4125-bb60-8d7d97c9e234',
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
                    { type: 'list-item-child', children: [{ text: 'Eins ' }] },
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
                    { children: [{ text: 'Zwei ' }], type: 'list-item-child' },
                  ],
                  type: 'list-item',
                },
              ],
              type: 'unordered-list',
            },
          ],
          id: '1a9dedfb-4d93-4ab1-b6b4-dea8f485ebf7',
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
          id: 'e410a4f0-3dbc-4538-9d77-b2e02204670e',
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
                  id: 'eb218eea-964f-4a90-b46c-f38211a18294',
                },
              ],
              id: '03088201-9858-4387-9cbf-bac320029c6d',
            },
            illustrating: true,
            multimedia: {
              plugin: 'edusharingAsset',
              state: {},
              id: 'ec5a297d-900f-41a3-8dd0-feaffc398ad8',
            },
            width: 50,
          },
          id: '63d4d204-7903-4def-bc9d-4a04a071febf',
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
          id: 'e69b1e49-485f-4448-955d-c687bc808f59',
        },
        {
          plugin: 'highlight',
          state: {
            code: "console.log('Hallo Welt!')",
            language: 'javascript',
          },
          id: '07ec66fc-b427-4a7a-9734-7adbd594e82c',
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
          id: 'd3fff273-beb5-4450-9a41-671dd4f0310c',
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
                  id: '72ad4d6d-86f6-4a32-817e-c28a7a40b5f9',
                },
              ],
              id: '30cc0d70-ccb6-4991-8740-308c0b6a50f0',
            },
          },
          id: '218fd9a3-8e3a-4061-bf13-a816bf2b6287',
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
          id: 'eeb56a2f-d421-438a-bd68-a17b70a70141',
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
                  state: [{ type: 'p', children: [{ text: 'Spoilerinhalt' }] }],
                  id: 'ceda02bd-6b29-4080-ab40-9fa1a8f17201',
                },
              ],
              id: 'ef1f1012-19ee-4cd3-abc2-324283172c41',
            },
          },
          id: '444a273a-257b-4058-92e7-cf46a3dc961f',
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
          id: '716e193f-f657-4961-b571-94fc8bcb3503',
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
                      id: 'b170cf68-55ab-4a58-b500-5d6eb1e50147',
                    },
                  },
                  {
                    content: {
                      plugin: 'text',
                      state: [{ type: 'p', children: [{ text: 'B' }] }],
                      id: '2f3fe89b-47f8-4ed5-b31f-f61b7bbc8ae9',
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
                      id: 'ea5c4bc1-1bd3-403b-9df0-58931e2529c0',
                    },
                  },
                  {
                    content: {
                      plugin: 'text',
                      state: [{ type: 'p', children: [{ text: '2' }] }],
                      id: 'adc6e016-462f-4894-92c0-b5e59f916ae4',
                    },
                  },
                ],
              },
            ],
            tableType: 'OnlyColumnHeader',
          },
          id: 'e9f007bd-ac55-4b3b-b16a-bba4589130de',
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
          id: '16e711d0-1c9d-4e25-8eb9-6cac60ec6069',
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
                  id: 'ff3f8e57-48b1-40de-ab9e-8bd9aa9b3356',
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
                  id: '4ae96bca-65a3-429a-ad46-ea8c39d9a9f7',
                },
              },
            ],
            firstExplanation: {
              plugin: 'text',
              state: [{ type: 'p', children: [{ text: 'Gleichung' }] }],
              id: '25dd4444-39d9-479e-9309-d5281b813fab',
            },
            transformationTarget: 'equation',
          },
          id: '5ee605ad-d43d-4c29-a2c0-fd777d839596',
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
          id: '87d18f20-1689-4f28-8b4a-8269c5c2f6c0',
        },
        {
          plugin: 'geogebra',
          state: 'nv5wNx9R',
          id: '3dad2f20-b9ff-43b6-b2c9-02060489497b',
        },
        {
          plugin: 'text',
          state: [
            {
              type: 'h',
              level: 2,
              children: [{ text: 'Interaktive Aufgaben' }],
            },
          ],
          id: '302a533b-799b-432c-8eef-31f1ca97bca0',
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
                  id: '1393c898-152a-4c1c-8b7a-88867a8647c7',
                },
              ],
              id: 'bdbb5824-26d3-40e2-a3a2-4b0aa07ad153',
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
                      id: '636fe162-3737-4b7c-97c9-b3b29cb99199',
                    },
                    isCorrect: true,
                    feedback: {
                      plugin: 'text',
                      state: [{ type: 'p', children: [{ text: '' }] }],
                      id: '972cfd65-d0ec-4940-831d-46d6f81cf6b5',
                    },
                  },
                  {
                    content: {
                      plugin: 'text',
                      state: [{ type: 'p', children: [{ text: 'B' }] }],
                      id: '63856a1e-c8f0-489a-a9cb-6ee397174c99',
                    },
                    isCorrect: false,
                    feedback: {
                      plugin: 'text',
                      state: [{ type: 'p', children: [{ text: '' }] }],
                      id: '4b8fdd74-17ef-429d-8a0e-32c62b03f82a',
                    },
                  },
                ],
              },
              id: '238b6bd3-2c2a-4d82-bc7d-f2adc286e197',
            },
          },
          id: '64044b37-a89c-4c2d-a439-2a2ec3cd5857',
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
                    { type: 'p', children: [{ text: 'Eingabefeld Aufgabe' }] },
                  ],
                  id: '4cacab0c-7ce1-4adf-9508-f5fac4b7540b',
                },
              ],
              id: '08952e3f-81cf-4ed7-b17c-61197fc0528c',
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
                      id: 'a3ac3b76-8013-4e84-b953-69ed2446913b',
                    },
                  },
                ],
              },
              id: '2fb34a1d-11a8-47dc-b835-06e479544441',
            },
          },
          id: '0e72d4c1-c18e-4716-b421-f078f6dec144',
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
                  id: 'f9b316de-bb84-43ec-9159-3209095673cd',
                },
              ],

              id: '3a455039-79be-47ec-b99e-fc39d8f3b6c6',
            },
            interactive: {
              plugin: 'textAreaExercise',
              state: {},
              id: '931f2365-3720-4d81-b744-07c1265263a1',
            },
          },
          id: '48db8e56-9b63-4eba-9bd1-ef3439bfe529',
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
                  id: 'a829b9c8-283d-44a4-941c-7a9ca5bdfd58',
                },
              ],
              id: '1a0c1946-4018-4c01-9a76-bfe83c3e4451',
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
                  id: '9fefedc4-f7cd-40d9-97f1-1088854adb28',
                },
              },
              id: '7135bad9-7f24-4c43-9f8c-bbc7344b2765',
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
                      id: 'bb275677-8814-4056-b595-c3a9468066ad',
                    },
                  ],
                },
                strategy: {
                  plugin: 'rows',
                  state: [
                    {
                      plugin: 'text',
                      state: [{ type: 'p', children: [{ text: 'Strategie' }] }],
                      id: 'ce1983c2-f0b5-43ec-b9db-ebfdb265084b',
                    },
                  ],
                  id: '9e9a9a04-c3c1-40e0-977c-6d47543bb865',
                },
              },
              id: '8b893803-dcf2-4d44-9e11-982006c2bdf4',
            },
          },
          id: '007d683b-d223-4346-b865-698b5dea0846',
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
          id: '9906e03f-8db2-47f9-8e66-342241719725',
        },
        {
          plugin: 'serloInjection',
          state: '54210',
          id: '3e42a5bc-78c8-4c48-b58f-3742b8cf9614',
        },
      ],
      id: '226ebb07-9830-43ad-ad59-c74280590024',
    },
  },
  id: 'c87647b6-8d63-4dd8-8664-a28c02c26863',
}
