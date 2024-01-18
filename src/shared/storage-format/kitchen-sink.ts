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
        // Deactivated temporarily. Spoiler could not be uncollapsed in no-edit view.
        // TODO Reactivate this when fixed
        // {
        //   plugin: 'text',
        //   state: [
        //     {
        //       type: 'h',
        //       level: 2,
        //       children: [{ text: 'Spoiler' }],
        //     },
        //   ],
        // },
        // {
        //   plugin: 'spoiler',
        //   state: {
        //     title: 'Spoilertitel',
        //     content: {
        //       plugin: 'rows',
        //       state: [
        //         {
        //           plugin: 'text',
        //           state: [{ type: 'p', children: [{ text: 'Spoilerinhalt' }] }],
        //         },
        //       ],
        //     },
        //   },
        // },
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
}
