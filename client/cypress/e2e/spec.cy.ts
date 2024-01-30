const ADMIN_EMAIL = 'jon+110@dropbase.io';
const USER_EMAIL = 'jon+113@dropbase.io';

describe('Verifies that roles and specific permissions are granted edit access correctly.', () => {
	it('Tests admin can edit apps', () => {
		const testAppName = 'cypressTestApp1';
		cy.login(ADMIN_EMAIL, 'Password1');

		cy.createApp(testAppName);

		cy.createWidget();

		cy.get("[data-cy='components-list']").contains('Input 1').should('not.exist');
		cy.createInput();
		cy.get("[data-rbd-droppable-id='droppable-1']").contains('Input 1').should('exist');

		// Ensure that we can create function
		cy.root().contains('function1.sql').should('not.exist');
		cy.createSQLFunction();
		cy.root().contains('function1.sql').should('exist');

		// Deletes the test app
		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
	it('Tests that a user can only access apps but not edit them', () => {
		const testAppName = 'cypressTestApp1';
		cy.login(ADMIN_EMAIL, 'Password1');
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');

		cy.createApp(testAppName);

		cy.login(USER_EMAIL, 'Password1');
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');

		cy.root().contains(testAppName).should('exist');

		cy.get(`[data-cy='app-card-${testAppName}']`).click();

		cy.get("[data-cy='preview-toggle']").click();
		cy.createWidget();

		cy.root().contains('Add Component').should('not.exist');

		cy.createSQLFunction();
		cy.get("[data-cy='cancel-create-file']").click();
		cy.root().contains('function1.sql').should('not.exist');

		cy.login(ADMIN_EMAIL, 'Password1');
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
	it('Tests that a user can edit apps if given specific permissions', () => {
		const testAppName = 'cypressTestApp1';
		cy.login(ADMIN_EMAIL, 'Password1');
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');

		cy.createApp(testAppName);

		// Give user edit permissions
		cy.visit('http://localhost:3030/settings/permissions');
		cy.get("[data-cy='user-permissions']").click();
		cy.get(`[data-cy='user-${USER_EMAIL}']`).click();
		cy.wait(500);
		cy.get(`[data-cy='permission-row-${testAppName}']`).find('select').select(2);

		cy.get(`[data-cy='permission-row-${testAppName}']`).contains('Edit').should('exist');

		cy.login(USER_EMAIL, 'Password1');
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');

		cy.root().contains(testAppName).should('exist');

		cy.get(`[data-cy='app-card-${testAppName}']`).click();

		cy.get("[data-cy='preview-toggle']").click();
		cy.createWidget();

		cy.root().contains('Add Component').should('exist');

		cy.createSQLFunction();
		cy.root().contains('function1.sql').should('exist');

		cy.login(ADMIN_EMAIL, 'Password1');
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
});
