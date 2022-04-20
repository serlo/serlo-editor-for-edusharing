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
            { text: 'The editor supports ' },
            { text: 'rich text.', strong: true },
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
          children: [{ text: 'Blockquote' }],
        },
      ],
    },
    {
      plugin: 'blockquote',
      state: {
        plugin: 'text',
        state: [
          {
            type: 'p',
            children: [{ text: 'The editor supports ' }],
          },
        ],
      },
    },
    {
      plugin: 'text',
      state: [
        {
          type: 'h',
          level: 2,
          children: [{ text: 'Highlight' }],
        },
      ],
    },
    {
      plugin: 'highlight',
      state: {
        code: "console.log('Hello, world')",
        language: 'javascript',
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
        title: 'Spoiler',
        content: {
          plugin: 'rows',
          state: [
            {
              plugin: 'text',
              state: [{ type: 'p', children: [{ text: 'Spoiler' }] }],
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
          children: [{ text: 'Input Exercise' }],
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
