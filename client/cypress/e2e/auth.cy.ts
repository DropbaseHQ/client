const ADMIN_EMAIL = 'jon+110@dropbase.io';
const USER_EMAIL = 'jon+113@dropbase.io';
const MEMBER_EMAIL = 'jon+103@dropbase.io';
const NON_MEMBER_EMAIL = 'jon+100@dropbase.io';
const MEMBER_TO_INVITE_EMAIL = 'jon+105@dropbase.io';
const TEST_PASSWORD = 'Password1';

const testAppName = 'cypresstestapp1';
describe('Verifies that roles and specific permissions are granted edit access correctly.', () => {
	beforeEach(function () {
		// Delete test app if exists
		cy.login(ADMIN_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');
		cy.get('body').then(($body) => {
			if ($body.text().includes(testAppName)) {
				cy.deleteApp(testAppName);
			}
		});
	});
	it.only('Tests admin can edit apps', () => {
		cy.login(ADMIN_EMAIL, TEST_PASSWORD);

		cy.createApp(testAppName);

		cy.createWidget();

		cy.get("[data-cy='components-list']").contains('input1').should('not.exist');
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input1')
			.should('exist');

		// Ensure that we can create function
		cy.root().contains('function1.sql').should('not.exist');
		cy.createSQLFunction();
		cy.root().contains('function1.sql').should('exist');
		cy.wait(1000);
		// Deletes the test app
		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
	it('Tests that a user can only access apps but not edit them', () => {
		cy.login(ADMIN_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');

		cy.createApp(testAppName);

		cy.login(USER_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');

		cy.root().contains(testAppName).should('exist');

		cy.get(`[data-cy='app-card-${testAppName}']`).click();

		cy.get("[data-cy='preview-toggle']").should('not.exist');

		cy.visit(`http://localhost:3030/${testAppName}/page1/studio`);
		cy.url().should('not.include', 'studio');

		cy.login(ADMIN_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
	it('Tests that a user can edit apps if given specific permissions', () => {
		cy.login(ADMIN_EMAIL, TEST_PASSWORD);
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

		cy.login(USER_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');

		cy.root().contains(testAppName).should('exist');

		cy.get(`[data-cy='app-card-${testAppName}']`).click();

		cy.get("[data-cy='preview-toggle']").click();
		cy.createWidget();

		cy.root().contains('Add Component').should('exist');

		cy.createSQLFunction();
		cy.root().contains('function1.sql').should('exist');

		cy.login(ADMIN_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
	it.skip("Tests that a user who is removed from a workspace can't use apps", () => {
		cy.login(ADMIN_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');

		cy.createApp(testAppName);

		// Remove user from workspace
		cy.visit('http://localhost:3030/settings/members');
		cy.get(`[data-cy='remove-member-${USER_EMAIL}']`).click();

		cy.login(USER_EMAIL, TEST_PASSWORD);
		cy.get(`[data-cy='workspace-${ADMIN_EMAIL}']`).should('not.exist');

		cy.visit('http://localhost:3030/apps');

		cy.get(`[data-cy='app-card-${testAppName}']`).click();

		cy.url().should('not.include', testAppName);

		cy.login(ADMIN_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
	it('Tests that a member can not access apps', () => {
		cy.login(ADMIN_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');

		cy.createApp(testAppName);

		cy.login(MEMBER_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);

		cy.visit('http://localhost:3030/apps');

		cy.get(`[data-cy='app-card-${testAppName}']`).click();

		cy.url().should('not.include', testAppName);

		cy.login(ADMIN_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
	it('Tests that a member can edit apps if given specific permissions', () => {
		cy.login(ADMIN_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');

		cy.createApp(testAppName);

		// Give member edit permissions
		cy.visit('http://localhost:3030/settings/permissions');
		cy.get("[data-cy='user-permissions']").click();
		cy.get(`[data-cy='user-${MEMBER_EMAIL}']`).click();
		cy.wait(500);
		cy.get(`[data-cy='permission-row-${testAppName}']`).find('select').select(2);

		cy.get(`[data-cy='permission-row-${testAppName}']`).contains('Edit').should('exist');

		cy.login(MEMBER_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');

		cy.root().contains(testAppName).should('exist');

		cy.get(`[data-cy='app-card-${testAppName}']`).click();

		cy.get("[data-cy='preview-toggle']").should('exist');
		cy.get("[data-cy='preview-toggle']").click();
		cy.createWidget();

		cy.root().contains('Add Component').should('exist');

		cy.createSQLFunction();
		cy.root().contains('function1.sql').should('exist');

		cy.login(ADMIN_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
	it("Tests that a non-member can't access apps", () => {
		cy.login(ADMIN_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');

		cy.createApp(testAppName);

		cy.login(NON_MEMBER_EMAIL, TEST_PASSWORD);
		cy.get(`[data-cy='workspace-${ADMIN_EMAIL}']`).should('not.exist');

		cy.visit('http://localhost:3030/apps');

		cy.get(`[data-cy='app-card-${testAppName}']`).click();

		cy.url().should('not.include', testAppName);

		cy.login(ADMIN_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});

	it('Tests that member cannot invite members', () => {
		cy.login(MEMBER_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/settings/members');

		cy.get("[data-cy='add-member']").click();
		cy.get("[data-cy='new-member-email']").type(MEMBER_TO_INVITE_EMAIL);
		cy.get("[data-cy='new-member-role']").select('Member');

		cy.get("[data-cy='invite-member']").click();

		cy.root().contains(MEMBER_TO_INVITE_EMAIL).should('not.exist');
	});

	it('Tests that user cannot invite members', () => {
		cy.login(USER_EMAIL, TEST_PASSWORD);
		cy.chooseWorkspace(ADMIN_EMAIL);
		cy.visit('http://localhost:3030/settings/members');

		cy.get("[data-cy='add-member']").click();
		cy.get("[data-cy='new-member-email']").type(MEMBER_TO_INVITE_EMAIL);
		cy.get("[data-cy='new-member-role']").select('Member');

		cy.get("[data-cy='invite-member']").click();

		cy.root().contains(MEMBER_TO_INVITE_EMAIL).should('not.exist');
	});

	it('Tests that only admin can change permissions');
});
