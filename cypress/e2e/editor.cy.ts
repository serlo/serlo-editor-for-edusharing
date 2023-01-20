beforeEach(() => {
  cy.task('initEdusharingServer')
})

it('The editor can be called via the LTI Workflow', () => {
  openSerloEditorWithLTI()

  cy.contains('Benannte Version speichern')
})

describe('Opening the editor as tool', () => {
  it('fails when the LTI custom claim (sent by edusharing) is missing a non-optional property', () => {
    cy.task('deleteDataToken')

    openSerloEditorWithLTI()

    cy.contains(
      'The LTI claim https://purl.imsglobal.org/spec/lti/claim/custom was invalid during the tool launch.'
    )
  })

  // TODO this test passes but editor does not appear. 
  it('succeeds when the LTI custom claim (sent by edusharing) is missing an optional property', () => {
    cy.task('deletePostContentApiUrl')

    openSerloEditorWithLTI()

    cy.contains('Something went wrong!').should('not.exist')
  })
})

it('Button "Saved named version" saves a named version', () => {
  openSerloEditorWithLTI()

  cy.contains('Benannte Version speichern').click()
  cy.get('input[placeholder="Name der neuen Version"]').type('version-name')
  cy.contains(/^Speichern$/).click()
  cy.contains(/^Speichern$/).should('not.exist')

  cy.task('getSavedVersionsInEdusharing').then((savedVersions) => {
    expect(savedVersions)
      .to.be.an('array')
      .that.deep.includes({ comment: 'version-name' })
  })
})

it('Assets from edu-sharing can be included', () => {
  openSerloEditorWithLTI()

  embedEdusharingAsset()

  cy.contains('Inhalt von edu-sharing')
})

function embedEdusharingAsset() {
  cy.get('div.add-trigger').eq(1).click()
  cy.contains('Edusharing Inhalte').click()
  cy.contains('Datei von edu-sharing einbinden').click()
  // TODO: Find a way around this wait
  cy.wait(6000)
}

function openSerloEditorWithLTI() {
  cy.visit('http://localhost:8100')
}

export {}
