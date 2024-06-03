/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add('login', (email: string, password: string) => {
	cy.visit('http://localhost:3030/login');
	cy.get("[data-cy='email']").type(email);
	cy.get("[data-cy='password']").type(password);
	cy.get("[data-cy='sign-in']").click();

	cy.url().should('include', '/apps');
});

Cypress.Commands.add('chooseWorkspace', (workspaceOwner: string) => {
	cy.visit('http://localhost:3030/workspaces');
	cy.get(`[data-cy='workspace-${workspaceOwner}']`).contains(workspaceOwner).click();
});

Cypress.Commands.add('loginAndChooseWorkspace', (email: string, password: string) => {
	cy.login(email, password);
	cy.chooseWorkspace(email);
	cy.visit('http://localhost:3030/apps');
});

Cypress.Commands.add('createApp', (appName: string) => {
	cy.get("[data-cy='create-app-button']").click();
	cy.get("[data-cy='app-name']").type(appName);
	cy.get("[data-cy='confirm-create-app']").click();
});

Cypress.Commands.add('createWidget', (widgetName?: string) => {
	cy.get("[data-cy='build-widget']").click();
});

Cypress.Commands.add('createInput', (inputName?: string) => {
	cy.get("[data-cy='add-component-button']").click();
	cy.get("[data-cy='add-component-button']").siblings().find('button').contains('input').click();
});
Cypress.Commands.add('createSQLFunction', (functionName?: string) => {
	cy.get("[data-cy='create-file-button']").click();
	cy.get("[data-cy='file-type']").click();
	cy.wait(200);
	cy.get("[data-cy='select-option-0']").click({ force: true });
	cy.get("[data-cy='confirm-create-file']").click();
});
Cypress.Commands.add('createPythonFunction', (functionName?: string) => {
	cy.get("[data-cy='create-file-button']").click();
	cy.get("[data-cy='file-type']").click();
	cy.wait(200);
	cy.get("[data-cy='select-option-1']").click({ force: true });
	cy.wait(200);

	cy.get("[data-cy='confirm-create-file']").click();
});

Cypress.Commands.add('deleteApp', (appName: string) => {
	appName = appName.toLowerCase();
	cy.get(`[data-cy="app-menu-${appName}"]`).click();
	cy.get(`[data-cy="delete-app-${appName}"]`).click();

	cy.get(`[data-cy="confirm-delete-app-input-${appName}"]`).type(appName);
	cy.get(`[data-cy="confirm-delete-app-${appName}"]`).click();
});
