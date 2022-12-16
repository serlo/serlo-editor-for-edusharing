const postCssConfig = {
  plugins: [tailwind(tailwindConfig), autoprefixer],
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default postCssConfig
