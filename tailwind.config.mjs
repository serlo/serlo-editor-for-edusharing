const tailwindConfig = {
  mode: 'jit',
  content: ['src/**/*.tsx'],
  plugins: [require('@tailwindcss/typography')],
  theme: {
    extend: {
      borderWidth: {
        3: '3px',
        6: '6px',
      },
    },
    screens: {
      mobile: '500px',
    },
  },
}

export default tailwindConfig
