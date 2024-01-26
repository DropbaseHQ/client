describe('My First Test', () => {
	it('Visits login', () => {
		const testAppName = 'cypressTestApp1';
		cy.visit('http://localhost:3030/login');
		cy.get('[data-cy="email"]').type('jon+132@dropbase.io');
		cy.get('[data-cy="password"]').type('Password1');
		cy.get('[data-cy="sign-in"]').click();

		cy.url().should('include', '/apps');

		// Creates a test app

		cy.get("[data-cy='create-app-button']").click();
		cy.get("[data-cy='app-name']").type(testAppName);
		cy.get("[data-cy='confirm-create-app']").click();

		// Ensure that we can create widget
		cy.get("[data-cy='build-widget']").click();
		cy.get("[data-cy='components-list']").contains('Input 1').should('not.exist');
		cy.get("[data-cy='add-component-button']").click();
		cy.get("[data-cy='add-component-button']")
			.siblings()
			.find('button')
			.contains('input')
			.click();

		cy.get("[data-rbd-droppable-id='droppable-1']").contains('Input 1').should('exist');

		// Ensure that we can create function
		cy.root().contains('function1.sql').should('not.exist');
		cy.get("[data-cy='create-file-button']").click();
		cy.get("[data-cy='file-type']").click();
		cy.get("[data-cy='select-option-0']").click();
		cy.get("[data-cy='confirm-create-file']").click();
		cy.root().contains('function1.sql').should('exist');

		// Deletes the test app
		cy.visit('http://localhost:3030/apps');
		cy.get(`[data-cy="app-menu-${testAppName}"]`).click();
		cy.get(`[data-cy="delete-app-${testAppName}"]`).click();

		cy.get(`[data-cy="confirm-delete-app-input-${testAppName}"]`).type(testAppName);
		cy.get(`[data-cy="confirm-delete-app-${testAppName}"]`).click();
	});
});
