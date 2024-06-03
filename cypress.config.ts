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
			ADMIN_EMAIL: 'jon+110@dropbase.io',
			USER_EMAIL: 'jon+113@dropbase.io',
			MEMBER_EMAIL: 'jon+103@dropbase.io',
			NON_MEMBER_EMAIL: 'jon+100@dropbase.io',
			MEMBER_TO_INVITE_EMAIL: 'jon+105@dropbase.io',
			TEST_PASSWORD: 'Password1',
		},
	},
});
