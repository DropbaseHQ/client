const testAppName = 'cypresstestapp1';
describe('Verifies that display rules work with widgets', () => {
	beforeEach(function () {
		// Delete test app if exists
		cy.loginAndChooseWorkspace(Cypress.env('ADMIN_EMAIL'), Cypress.env('TEST_PASSWORD'));
		cy.visit('http://localhost:3030/apps');
		cy.get('body').then(($body) => {
			if ($body.text().includes(testAppName)) {
				cy.deleteApp(testAppName);
			}
		});
	});

	it('Tests that a user can target an input with a display rule', () => {
		cy.loginAndChooseWorkspace(Cypress.env('ADMIN_EMAIL'), Cypress.env('TEST_PASSWORD'));
		cy.createApp(testAppName);
		cy.createWidget();
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input1')
			.should('exist');
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input2')
			.should('exist');
		cy.get("[data-cy='component-input2-inspector']").click();
		// cy.get("[data-cy='widget-pane-name']").contains('input2').should('exist');
		cy.get("[data-cy='add-display-rule']").click();
		cy.get("[data-cy='display-rule-target']").type('input1{enter}');

		cy.get("[data-cy='display-rule-operator']").contains('Greater than').should('not.exist');

		cy.get("[data-cy='display-rule-operator']").contains('Less than').should('not.exist');

		cy.get("[data-cy='display-rule-operator']").select('Equal to');
		cy.get("[data-cy='display-rule-value']").type('test');

		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='preview-toggle']").click();

		cy.root().contains('Input1').should('exist');
		cy.root().contains('Input2').should('not.exist');

		cy.get("[data-cy='input-input1']").type('test', { delay: 100 });
		cy.root().contains('Input2').should('exist');

		cy.get("[data-cy='input-input1']").type('test2', { delay: 100 });
		cy.root().contains('Input2').should('not.exist');

		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});

	it('Tests that the display rule value presents relevant operators based on input data type', () => {
		cy.loginAndChooseWorkspace(Cypress.env('ADMIN_EMAIL'), Cypress.env('TEST_PASSWORD'));
		cy.createApp(testAppName);
		cy.createWidget();
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input1')
			.should('exist');
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input2')
			.should('exist');

		// Change input1 to integer
		cy.get("[data-cy='component-input1-inspector']").click();
		cy.get("[data-cy='property-Data Type']").select('integer');

		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='component-input2-inspector']").click();

		cy.get("[data-cy='add-display-rule']").click();
		cy.get("[data-cy='display-rule-target']").type('input1{enter}');
		cy.get("[data-cy='display-rule-operator']").contains('Greater than').should('exist');
		cy.get("[data-cy='display-rule-operator']").contains('Less than').should('exist');

		// Change input1 to float
		cy.get("[data-cy='component-input1-inspector']").click();
		cy.get("[data-cy='property-Data Type']").select('float');

		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='component-input2-inspector']").click();

		cy.get("[data-cy='add-display-rule']").click();
		cy.get("[data-cy='display-rule-target']").type('input1{enter}');
		cy.get("[data-cy='display-rule-operator']").contains('Greater than').should('exist');
		cy.get("[data-cy='display-rule-operator']").contains('Less than').should('exist');

		// Change input1 to datetime
		cy.get("[data-cy='component-input1-inspector']").click();
		cy.get("[data-cy='property-Data Type']").select('datetime');

		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='component-input2-inspector']").click();

		cy.get("[data-cy='add-display-rule']").click();
		cy.get("[data-cy='display-rule-target']").type('input1{enter}');
		cy.get("[data-cy='display-rule-operator']").contains('Greater than').should('exist');
		cy.get("[data-cy='display-rule-operator']").contains('Less than').should('exist');

		// Change input1 to date
		cy.get("[data-cy='component-input1-inspector']").click();
		cy.get("[data-cy='property-Data Type']").select('date');

		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='component-input2-inspector']").click();

		cy.get("[data-cy='add-display-rule']").click();
		cy.get("[data-cy='display-rule-target']").type('input1{enter}');
		cy.get("[data-cy='display-rule-operator']").contains('Greater than').should('exist');
		cy.get("[data-cy='display-rule-operator']").contains('Less than').should('exist');

		// Change input1 to time
		cy.get("[data-cy='component-input1-inspector']").click();
		cy.get("[data-cy='property-Data Type']").select('float');

		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='component-input2-inspector']").click();

		cy.get("[data-cy='add-display-rule']").click();
		cy.get("[data-cy='display-rule-target']").type('input1{enter}');
		cy.get("[data-cy='display-rule-operator']").contains('Greater than').should('exist');
		cy.get("[data-cy='display-rule-operator']").contains('Less than').should('exist');

		// Change input to text
		cy.get("[data-cy='component-input1-inspector']").click();
		cy.get("[data-cy='property-Data Type']").select('text');

		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='component-input2-inspector']").click();

		cy.get("[data-cy='add-display-rule']").click();
		cy.get("[data-cy='display-rule-target']").type('input1{enter}');
		cy.get("[data-cy='display-rule-operator']").contains('Greater than').should('not.exist');
		cy.get("[data-cy='display-rule-operator']").contains('Less than').should('not.exist');

		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});

	it('Tests that display rules work with a integer input', () => {
		cy.loginAndChooseWorkspace(Cypress.env('ADMIN_EMAIL'), Cypress.env('TEST_PASSWORD'));
		cy.createApp(testAppName);
		cy.createWidget();
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input1')
			.should('exist');
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input2')
			.should('exist');

		cy.get("[data-cy='component-input1-inspector']").click();
		cy.get("[data-cy='property-Data Type']").select('integer');
		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='component-input2-inspector']").click();

		cy.get("[data-cy='add-display-rule']").click();
		cy.get("[data-cy='display-rule-target']").type('input1{enter}');

		cy.get("[data-cy='display-rule-operator']").contains('Greater than').should('exist');

		cy.get("[data-cy='display-rule-operator']").contains('Less than').should('exist');

		cy.get("[data-cy='display-rule-operator']").select('Equal to');
		cy.get("[data-cy='display-rule-value']")
			.type('{selectall}{backspace}')
			.type('5', { delay: 100 });

		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='preview-toggle']").click();

		cy.root().contains('Input1').should('exist');
		cy.root().contains('Input2').should('not.exist');

		cy.get("[data-cy='input-input1']").type('5', { delay: 100 });
		cy.root().contains('Input2').should('exist');

		cy.get("[data-cy='input-input1']").type('4', { delay: 100 });
		cy.root().contains('Input2').should('not.exist');

		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
	it('Tests that display rules work with a float input', () => {
		cy.loginAndChooseWorkspace(Cypress.env('ADMIN_EMAIL'), Cypress.env('TEST_PASSWORD'));
		cy.createApp(testAppName);
		cy.createWidget();
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input1')
			.should('exist');
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input2')
			.should('exist');

		cy.get("[data-cy='component-input1-inspector']").click();
		cy.get("[data-cy='property-Data Type']").select('float');
		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='component-input2-inspector']").click();

		cy.get("[data-cy='add-display-rule']").click();
		cy.get("[data-cy='display-rule-target']").type('input1{enter}');

		cy.get("[data-cy='display-rule-operator']").contains('Greater than').should('exist');

		cy.get("[data-cy='display-rule-operator']").contains('Less than').should('exist');

		cy.get("[data-cy='display-rule-operator']").select('Equal to');
		cy.get("[data-cy='display-rule-value']")
			.type('{selectall}{backspace}')
			.type('5', { delay: 100 });

		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='preview-toggle']").click();

		cy.root().contains('Input1').should('exist');
		cy.root().contains('Input2').should('not.exist');

		cy.get("[data-cy='input-input1']").type('5', { delay: 100 });
		cy.root().contains('Input2').should('exist');

		cy.get("[data-cy='input-input1']").type('4', { delay: 100 });
		cy.root().contains('Input2').should('not.exist');

		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
	it('Tests that display rules work with a datetime input', () => {
		cy.loginAndChooseWorkspace(Cypress.env('ADMIN_EMAIL'), Cypress.env('TEST_PASSWORD'));
		cy.createApp(testAppName);
		cy.createWidget();
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input1')
			.should('exist');
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input2')
			.should('exist');

		cy.get("[data-cy='component-input1-inspector']").click();
		cy.get("[data-cy='property-Data Type']").select('datetime');
		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='component-input2-inspector']").click();

		cy.get("[data-cy='add-display-rule']").click();
		cy.get("[data-cy='display-rule-target']").type('input1{enter}');

		cy.get("[data-cy='display-rule-operator']").contains('Greater than').should('exist');

		cy.get("[data-cy='display-rule-operator']").contains('Less than').should('exist');

		cy.get("[data-cy='display-rule-operator']").select('Equal to');
		cy.get("[data-cy='display-rule-value']").type('2025-01-12T01:01:01', {
			delay: 100,
		});
		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='preview-toggle']").click();

		cy.root().contains('Input1').should('exist');
		cy.root().contains('Input2').should('not.exist');

		cy.get("[data-cy='input-input1']").type('2025-01-12T01:01:01', { delay: 100 });
		cy.root().contains('Input2').should('exist');

		cy.get("[data-cy='input-input1']").type('2025-01-13T01:01:01', { delay: 100 });
		cy.root().contains('Input2').should('not.exist');

		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
	it('Tests that display rules work with a date input', () => {
		cy.loginAndChooseWorkspace(Cypress.env('ADMIN_EMAIL'), Cypress.env('TEST_PASSWORD'));
		cy.createApp(testAppName);
		cy.createWidget();
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input1')
			.should('exist');
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input2')
			.should('exist');

		cy.get("[data-cy='component-input1-inspector']").click();
		cy.get("[data-cy='property-Data Type']").select('date');
		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='component-input2-inspector']").click();

		cy.get("[data-cy='add-display-rule']").click();
		cy.get("[data-cy='display-rule-target']").type('input1{enter}');

		cy.get("[data-cy='display-rule-operator']").contains('Greater than').should('exist');

		cy.get("[data-cy='display-rule-operator']").contains('Less than').should('exist');

		cy.get("[data-cy='display-rule-operator']").select('Equal to');
		cy.get("[data-cy='display-rule-value']").type('2025-01-12', {
			delay: 100,
		});
		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='preview-toggle']").click();

		cy.root().contains('Input1').should('exist');
		cy.root().contains('Input2').should('not.exist');

		cy.get("[data-cy='input-input1']").type('2025-01-12', { delay: 100 });
		cy.root().contains('Input2').should('exist');

		cy.get("[data-cy='input-input1']").type('2025-01-13', { delay: 100 });
		cy.root().contains('Input2').should('not.exist');

		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
	it('Tests that display rules work with a time input', () => {
		cy.loginAndChooseWorkspace(Cypress.env('ADMIN_EMAIL'), Cypress.env('TEST_PASSWORD'));
		cy.createApp(testAppName);
		cy.createWidget();
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input1')
			.should('exist');
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input2')
			.should('exist');

		cy.get("[data-cy='component-input1-inspector']").click();
		cy.get("[data-cy='property-Data Type']").select('time');
		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='component-input2-inspector']").click();

		cy.get("[data-cy='add-display-rule']").click();
		cy.get("[data-cy='display-rule-target']").type('input1{enter}');

		cy.get("[data-cy='display-rule-operator']").contains('Greater than').should('exist');

		cy.get("[data-cy='display-rule-operator']").contains('Less than').should('exist');

		cy.get("[data-cy='display-rule-operator']").select('Equal to');
		cy.get("[data-cy='display-rule-value']").type('01:01:01', {
			delay: 100,
		});
		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='preview-toggle']").click();

		cy.root().contains('Input1').should('exist');
		cy.root().contains('Input2').should('not.exist');

		cy.get("[data-cy='input-input1']").type('01:01:01', { delay: 100 });
		cy.root().contains('Input2').should('exist');

		cy.get("[data-cy='input-input1']").type('02:01:01', { delay: 100 });
		cy.root().contains('Input2').should('not.exist');

		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
	it('Tests that display rule with integer and comparator operator works', () => {
		cy.loginAndChooseWorkspace(Cypress.env('ADMIN_EMAIL'), Cypress.env('TEST_PASSWORD'));
		cy.createApp(testAppName);
		cy.createWidget();
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input1')
			.should('exist');
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input2')
			.should('exist');

		cy.get("[data-cy='component-input1-inspector']").click();
		cy.get("[data-cy='property-Data Type']").select('integer');
		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='component-input2-inspector']").click();

		cy.get("[data-cy='add-display-rule']").click();
		cy.get("[data-cy='display-rule-target']").type('input1{enter}');

		cy.get("[data-cy='display-rule-operator']").contains('Greater than').should('exist');

		cy.get("[data-cy='display-rule-operator']").select('Greater than');
		cy.get("[data-cy='display-rule-value']")
			.type('{selectall}{backspace}')
			.type('5', { delay: 100 });

		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='preview-toggle']").click();

		cy.root().contains('Input1').should('exist');
		cy.root().contains('Input2').should('not.exist');

		cy.get("[data-cy='input-input1']")
			.type('{selectall}{backspace}')
			.type('10', { delay: 300 });
		cy.root().contains('Input2').should('exist');

		cy.get("[data-cy='input-input1']").type('{selectall}{backspace}').type('4', { delay: 100 });
		cy.root().contains('Input2').should('not.exist');

		cy.get("[data-cy='input-input1']").type('{selectall}{backspace}').type('5', { delay: 100 });
		cy.root().contains('Input2').should('not.exist');

		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
	it('Tests that display rule with float and comparator operator works', () => {
		cy.loginAndChooseWorkspace(Cypress.env('ADMIN_EMAIL'), Cypress.env('TEST_PASSWORD'));
		cy.createApp(testAppName);
		cy.createWidget();
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input1')
			.should('exist');
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input2')
			.should('exist');

		cy.get("[data-cy='component-input1-inspector']").click();
		cy.get("[data-cy='property-Data Type']").select('float');
		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='component-input2-inspector']").click();

		cy.get("[data-cy='add-display-rule']").click();
		cy.get("[data-cy='display-rule-target']").type('input1{enter}');

		cy.get("[data-cy='display-rule-operator']").contains('Greater than').should('exist');

		cy.get("[data-cy='display-rule-operator']").select('Greater than');
		cy.get("[data-cy='display-rule-value']")
			.type('{selectall}{backspace}')
			.type('5', { delay: 100 });

		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='preview-toggle']").click();

		cy.root().contains('Input1').should('exist');
		cy.root().contains('Input2').should('not.exist');

		cy.get("[data-cy='input-input1']")
			.type('{selectall}{backspace}')
			.type('10', { delay: 300 });
		cy.root().contains('Input2').should('exist');

		cy.get("[data-cy='input-input1']").type('{selectall}{backspace}').type('4', { delay: 100 });
		cy.root().contains('Input2').should('not.exist');

		cy.get("[data-cy='input-input1']").type('{selectall}{backspace}').type('5', { delay: 100 });
		cy.root().contains('Input2').should('not.exist');

		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
	it('Tests that display rule with datetime and comparator operator works', () => {
		cy.loginAndChooseWorkspace(Cypress.env('ADMIN_EMAIL'), Cypress.env('TEST_PASSWORD'));
		cy.createApp(testAppName);
		cy.createWidget();
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input1')
			.should('exist');
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input2')
			.should('exist');

		cy.get("[data-cy='component-input1-inspector']").click();
		cy.get("[data-cy='property-Data Type']").select('datetime');
		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='component-input2-inspector']").click();

		cy.get("[data-cy='add-display-rule']").click();
		cy.get("[data-cy='display-rule-target']").type('input1{enter}');

		cy.get("[data-cy='display-rule-operator']").contains('Greater than').should('exist');

		cy.get("[data-cy='display-rule-operator']").select('Greater than');
		cy.get("[data-cy='display-rule-value']").type('2025-01-12T01:01:01', {
			delay: 100,
		});
		cy.get("[data-cy='update-component']").click();

		cy.get("[data-cy='preview-toggle']").click();

		cy.root().contains('Input1').should('exist');
		cy.root().contains('Input2').should('not.exist');

		cy.get("[data-cy='input-input1']").type('2025-01-13T01:01:01', { delay: 100 });
		cy.root().contains('Input2').should('exist');

		cy.get("[data-cy='input-input1']").type('2025-01-10T01:01:01', { delay: 100 });
		cy.root().contains('Input2').should('not.exist');

		cy.visit('http://localhost:3030/apps');
		cy.deleteApp(testAppName);
	});
});

describe('Verifies that display rules work with table columns', () => {
	// TODO: Fix this test. Fails because when typing in the code editor, cypress crashes
	it.skip('Tests that display rules work with a table column', () => {
		cy.loginAndChooseWorkspace(Cypress.env('ADMIN_EMAIL'), Cypress.env('TEST_PASSWORD'));
		cy.createApp(testAppName);
		cy.createWidget();
		cy.createInput();
		cy.get("[data-rbd-droppable-id='widget-widget1-drop-area']")
			.contains('input1')
			.should('exist');

		cy.createPythonFunction();
		cy.wait(1000);
		cy.get(`[data-cy='code-editor-function1`).type('{selectall}{backspace}', { delay: 100 });

		// const pythonScript = `from workspace.test_dr_1.page1 import State
		// import pandas as pd
		// from datetime import datetime

		// def function2(state: State) -> pd.DataFrame:
		// 	data = {{}'text_column': ['apple', 'banana', 'orange'], 'integer_column': [1, 2, 3], 'float_column': [1.5, 2.5, 3.5], 'datetime_column': [datetime(2022, 1, 1), datetime(2022, 1, 2), datetime(2022, 1, 3)]{}}
		// 	df = pd.DataFrame(data)
		// 	return df
		// `;

		// Replace newlines with Cypress enter command and proper indentation
		// const formattedScript = pythonScript.replace(/\n/g, '{enter}    ');

		// cy.get(`[data-cy='code-editor-function1`).type(formattedScript, { delay: 100 });
		cy.get(`[data-cy='code-editor-function1`).find('textarea').should('exist');
		cy.get(`[data-cy='code-editor-function1`).find('textarea').type('hello');

		// cy.get("[data-cy='component-input1-inspector']").click();
		// cy.get("[data-cy='add-display-rule']").click();
		// cy.get("[data-cy='display-rule-target']").type('input1{enter}');

		// cy.get("[data-cy='display-rule-operator']").contains('Greater than').should('not.exist');

		// cy.get("[data-cy='display-rule-operator']").contains('Less than').should('not.exist');

		// cy.get("[data-cy='display-rule-operator']").select('Equal to');
		// cy.get("[data-cy='display-rule-value']").type('test');

		// cy.get("[data-cy='update-component']").click();

		// cy.get("[data-cy='preview-toggle']").click();

		// cy.root().contains('Input1').should('exist');
		// cy.root().contains('Input2').should('not.exist');

		// cy.get("[data-cy='input-input1']").type('test', { delay: 100 });
		// cy.root().contains('Input2').should('exist');

		// cy.get("[data-cy='input-input1']").type('test2', { delay: 100 });
		// cy.root().contains('Input2').should('not.exist');

		// cy.visit('http://localhost:3030/apps');
		// cy.deleteApp(testAppName);
	});
});
