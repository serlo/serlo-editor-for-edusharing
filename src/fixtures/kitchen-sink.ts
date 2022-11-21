export const kitchenSink = {
  plugin: 'rows',
  state: [
    {
      plugin: 'text',
      state: [
        {
          type: 'h',
          level: 1,
          children: [{ text: 'Kitchen Sink' }],
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
      plugin: 'inputExercise',
    },
    {
      plugin: 'text',
      state: [
        {
          type: 'h',
          level: 2,
          children: [{ text: 'Choice Exercise' }],
        },
      ],
    },
    {
      plugin: 'scMcExercise',
    },
  ],
}
