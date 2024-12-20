// Ensure that the user exist in the database if it's not found
Cypress.on('uncaught:exception', (err) => {
  // returning false here prevents Cypress from
  // failing the test
  console.log('Cypress detected uncaught exception: ', err)
  return false
})

describe('Connect a user', () => {
  it('visits the connect url', () => {
    cy.visit('/login')

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000)
    cy.contains('h1', 'Login')
  })

  it('connect user', () => {
    cy.visit('/login')

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000)
    cy.contains('h1', 'Login')
    cy.get('input[name="email"]').type('test_login@career-vault.local')
    cy.get('input[name="password"]').type(Cypress.env('test_connect_user_pwd'))
    cy.get('form button[type=submit]').click()

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000)

    cy.contains('h1', 'Your tracking')
  })
})
