// Verify that user doesn't existe inside the database

describe('My First Test', () => {
  it('visits the register url', () => {
    cy.visit('/register')

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000)
    cy.contains('h1', 'Register')
  })

  it('register user', () => {
    Cypress.on('uncaught:exception', (err, runnable) => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.visit('/register')

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000)
    cy.contains('h1', 'Register')
    cy.get('input[name="email"]').type('test@test.com')
    cy.get('input[name="pseudo"]').type('test_user')
    cy.get('input[name="lastname"]').type('Test user')
    cy.get('input[name="firstname"]').type('Test user')
    cy.get('input[name="password"]').type('Password123$')
    cy.get('input[name="confirmationPwd"]').type('Password123$')
    cy.get('form button[type=submit]').click()

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000)

    cy.contains('h1', 'Your tracking')
  })
})
