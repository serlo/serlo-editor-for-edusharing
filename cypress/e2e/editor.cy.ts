import { loadEnvConfig } from '@next/env'

describe('empty spec', () => {
  it('Calls editor', () => {
    loadEnvConfig(process.cwd())

    const url = process.env.EDITOR_URL ?? 'http://localhost:3000'

    cy.visit(url)
    cy.contains(/Rich Text/i)
  })
})
