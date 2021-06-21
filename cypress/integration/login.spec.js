describe('Login', function () {
  it('logs in the user', function () {
    cy.visit('http://localhost:3000/')

    cy.get('input[name="email"]').type('user1@dwellingly.org')
    cy.get('input[name="password"]').type('1234')
    cy.get('button').contains('LOG IN').click()

    cy.location('pathname').should('eq', '/dashboard')
  })
})
