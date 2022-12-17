it('The editor can be called via the LTI Workflow', () => {
  cy.visit('http://localhost:8100')
  cy.contains('Benannte Version speichern')
})

it('Button "Saved named version" saves a named version', () => {
  cy.request('DELETE', 'http://localhost:8100/_internals/saved-versions')

  cy.visit('http://localhost:8100')
  cy.contains('Benannte Version speichern').click()
  cy.get('input[placeholder="Name der neuen Version"]').type('version-name')
  cy.contains(/^Speichern$/).click()
  cy.contains(/^Speichern$/).should('not.exist')

  cy.request('http://localhost:8100/_internals/saved-versions').then(
    (response) => {
      expect(response.body)
        .to.be.an('array')
        .that.deep.includes({ comment: 'version-name' })
    }
  )
})

it('Assets from edu-sharing can be included', () => {
  cy.visit('http://localhost:8100/')

  cy.get('div.add-trigger').eq(1).click()
  cy.contains('Edusharing Inhalte').click()
  cy.contains('Datei von edu-sharing einbinden').click()
  cy.wait(6000)
  cy.contains('Inhalt von edu-sharing')
})

export {}
