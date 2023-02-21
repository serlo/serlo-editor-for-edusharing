beforeEach(() => {
  cy.task('initEdusharingServer')
})

it('The editor can be called via the LTI Workflow', () => {
  openSerloEditorWithLTI()

  expectEditorOpenedSuccessfully()
})

describe('Opening the editor as tool', () => {
  it('fails when the LTI custom claim (sent by edusharing) is missing a non-optional property', () => {
    cy.task('removePropertyInCustom', 'dataToken')

    openSerloEditorWithLTI()

    // TODO Could pull the exact error message from server.ts
    cy.contains('Something went wrong!')
  })

  it('fails and shows error message when content format is malformed', () => {
    cy.task('willSendContent', {
      somethingIsNotRightHere: 'something is not right here!',
    })

    openSerloEditorWithLTI()

    cy.contains('Content json received from edu-sharing was malformed.')
    cy.contains('Benannte Version speichern').should('not.exist')
  })

  it('succeeds when the editor is opened in view mode (postContentApiUrl is missing)', () => {
    cy.task('removePropertyInCustom', 'postContentApiUrl')

    openSerloEditorWithLTI()

    cy.contains('Benannte Version speichern').should('not.exist')
    cy.contains('Pluginübersicht')
  })
})

it('Button "Saved named version" saves a named version', () => {
  openSerloEditorWithLTI()

  expectEditorOpenedSuccessfully()

  cy.contains('Benannte Version speichern').click()
  cy.get('input[placeholder="Name der neuen Version"]').type('version-name')
  cy.contains(/^Speichern$/).click()
  cy.contains(/^Speichern$/).should('not.exist')

  expectSavedVersionWithComment('version-name')
})

describe('Feature to automatically save the document', () => {
  it('The editor saves automatically when it is open for long enough after there have been changes made.', () => {
    openSerloEditorWithLTI()
    changeContent()

    cy.wait(6000)
    expectSavedVersionWithComment(null)
  })

  it('The editor does not save automatically when there are no changes', () => {
    openSerloEditorWithLTI()

    // Wait 8 seconds -> Autosave is set to be done all 5 seconds
    cy.wait(8000)
    cy.task('getSavedVersionsInEdusharing').then((savedVersions) => {
      expect(savedVersions).to.be.an('array').that.has.lengthOf(0)
    })
  })
})

it('Saved versions can be opened again', () => {
  openSerloEditorWithLTI()

  changeContent()

  cy.visit('http://example.org/')
  cy.contains('Example Domain') // Reload is finished

  openSerloEditorWithLTI()

  cy.contains('Vorgehen')
})

it('Editor saves a named version of the document when the user navigates to another side', () => {
  const savedBySerloComment =
    'Diese Version wurde automatisch vom Serlo-Editor erstellt'

  openSerloEditorWithLTI()
  changeContent()

  cy.visit('http://example.org/')
  cy.contains('Example Domain') // Reload is finished

  cy.wait(100)
  expectSavedVersionWithComment(savedBySerloComment)
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

function changeContent() {
  // Create a new plugin
  cy.get('div.add-trigger').eq(1).click()
  // Search for the description text of the box plugin to get correct button to click. Searching for string "Box" does sometimes lead to issues when the string "Box" can be found elsewhere on the page.
  cy.contains(
    'Rahmen für deine Beispiele, Zitate, Warnungen, Beweise, …'
  ).click()
  cy.contains('Vorgehen').click()
  cy.contains('Pluginübersicht').click()
}

function openSerloEditorWithLTI() {
  cy.visit('http://localhost:8100')
}

function expectEditorOpenedSuccessfully() {
  cy.contains('Benannte Version speichern')
  cy.contains('Pluginübersicht')
}

function expectSavedVersionWithComment(comment: string | null) {
  cy.task('getSavedVersionsInEdusharing').then((savedVersions) => {
    expect(savedVersions).to.be.an('array').that.deep.includes({ comment })
  })
}

export {}
