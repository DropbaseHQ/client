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
		cy.wait(5000);
		cy.task('gmail:checkRecent', {
			from: 'support@dropbase.io',
			to: NEW_USER_EMAIL,
			subject: 'Verify your Dropbase email address',
			// Query emails from the last 10 seconds
			after: new Date(Date.now() - 10 * 1000).toISOString(),
		}).then((emails: any[]) => {
			expect(emails).to.exist;
			assert.isAtLeast(
				emails.length,
				1,
				'Expected to find at least one email, but none were found!',
			);
			const body = emails[0].body.html;
			console.log('body', body);
			assert.isTrue(body.indexOf('/email-confirmation/') >= 0, 'Found reset link!');
			// Get the confirmation link
			const confirmationLink = body.match(
				/\bhttps?:\/\/[^\/]+\/email-confirmation\/[^\/]+\/[^\/"]+\b/,
			);

			// Visit the confirmation link
			cy.visit(confirmationLink[0]);
			cy.url().should('include', '/email-confirmation');
			cy.contains('Email Confirmation Success!', {
				timeout: 5000,
			}).should('exist');

			// Confirm the email
		});
		cy.login(NEW_USER_INFO.email, NEW_USER_INFO.password);

		cy.url().should('include', '/apps');
	});
});
