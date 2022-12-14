it('The editor can be called via the LTI Workflow', () => {
  cy.visit('http://localhost:8100')
  cy.contains('Speichern & Schließen')
})

export {}
