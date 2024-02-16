const NEW_USER_EMAIL = '';

const NEW_USER_INFO = {
	firstName: 'Test1',
	lastName: 'Test1',
	email: 'jon+136@dropbase.io ',
	company: 'Test Company',
	password: 'Password1',
	confirmPassword: 'Password1',
};

describe('Sign up flow', () => {
	it('should sign up a new user', () => {
		cy.visit('http://localhost:3030/login');
		cy.get("[data-cy='link-to-register']").click();
		cy.url().should('include', '/register');
		cy.get("[data-cy='first-name']").type(NEW_USER_INFO.firstName);
		cy.get("[data-cy='last-name']").type(NEW_USER_INFO.lastName);
		cy.get("[data-cy='email']").type(NEW_USER_INFO.email);
		cy.get("[data-cy='company']").type(NEW_USER_INFO.company);
		cy.get("[data-cy='password']").type(NEW_USER_INFO.password);
		cy.get("[data-cy='confirm-password']").type(NEW_USER_INFO.confirmPassword);
		cy.get("[data-cy='sign-up-button']").click();
	});
});
