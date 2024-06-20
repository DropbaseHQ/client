import { defineConfig } from 'cypress';
import gmail from 'gmail-tester';
import path from 'path';
import process from 'process';

const cwd = process.cwd();
export default defineConfig({
	e2e: {
		setupNodeEvents(on, config) {
			// implement node event listeners here
			on('task', {
				'gmail:checkRecent': async (args) => {
					const { from, to, subject, after } = args;
					const email = await gmail.check_inbox(
						path.resolve(cwd, 'client_secret.json'),
						path.resolve(cwd, 'token.json'),
						{
							from: from,
							to: to,
							subject: subject,
							after: after,
							include_body: true,
							wait_time_sec: 10,
							max_wait_time_sec: 30,
						},
					);
					return email;
				},
			});
		},
		env: {
			// add environment variables here
			ADMIN_EMAIL: 'test@dropbase.io',
			TEST_PASSWORD: 'Password1',
		},
	},
});
