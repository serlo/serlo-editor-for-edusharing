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

  cy.task('getSavedVersionsInEdusharing').then((savedVersions) => {
    expect(savedVersions)
      .to.be.an('array')
      .that.deep.includes({ comment: 'version-name' })
  })
})

describe.only('An automatic save is created when', () => {
  it('navigating to a new url while the editor is open.', () => {
    openSerloEditorWithLTI()

    expectEditorOpenedSuccessfully()

    cy.wait(2000)

    cy.visit('http://www.example.com/')

    cy.wait(2000)

    expectAutomaticSavedVersion()
  })

  it('page is reloaded', () => {
    openSerloEditorWithLTI()
    
    expectEditorOpenedSuccessfully()

    cy.reload()

    expectEditorOpenedSuccessfully()

    expectAutomaticSavedVersion()
  })

  it('the editor is open for long enough to trigger an automatic save and there are unsaved changes in the content.', () => {
    openSerloEditorWithLTI()
    
    expectEditorOpenedSuccessfully()

    // Create a new plugin
    cy.get('div.add-trigger').eq(1).click()
    cy.contains('Edusharing Inhalte').click()

    cy.wait(6000)

    expectAutomaticSavedVersion()
  })

  function expectAutomaticSavedVersion() {
    cy.task('getSavedVersionsInEdusharing').then((savedVersions) => {
      if(!isNonEmptySavedVersionsArray(savedVersions)) {
        throw new Error("Expected savedVersions to be an non-empty Array<{ comment: string } but it was not.")
      }

      const mostRecentSavedVersion = savedVersions.pop()
      expect(mostRecentSavedVersion.comment.includes('automatisch'))
    })
  }

  function isNonEmptySavedVersionsArray(obj: unknown): obj is Array<{ comment: string }> {
    if(!Array.isArray(obj)) {
      return false; 
    }
    if(obj.length === 0) {
      return false;
    }
    const element = obj[0]
    return 'comment' in element && typeof element.comment === 'string'
  } 
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

function expectEditorOpenedSuccessfully() {
  cy.contains('Benannte Version speichern')
}

export {}
