import { defineConfig } from 'cypress'

export default defineConfig({
  // Disable checks in chrome "same-origin" in HTTP requests. Normally cypress
  // implements measures to avoid this problem. However due to the LTI the
  // domain changes often in the LTI worflow.
  //
  // see https://docs.cypress.io/guides/guides/web-security for more details
  //
  // TODO: Find a way to avoid this setting
  chromeWebSecurity: false,

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})
