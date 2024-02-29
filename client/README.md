# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

-   [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
-   [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

-   Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

-   Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
-   Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
-   Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Deploying to Cloudflare Pages

The deployment happens automatically when there are changes in `./client` directory.
See [client-deployment-dev.yml](../.github/workflows/client-deployment-dev.yml) for pipeline definition.

## Publish image to Docker Hub

- Any new commit on the `main` branch will trigger the build of Docker image with `latest` tag. The image will be pushed to DockerHub afterward.
- When there is a GitHub tag created in semver (e.g. `v1.2.3`), a corresponding Docker tag will be built and pushed to DockerHub

## Cypress Testing

### Setting Up Testing Accounts
As of now, the tests are set up with my test accounts (me being Jon). If you wish to run tests locally, you will have to change the test accounts to your accounts.

Test account details can be changed in the `cypress.config.ts` file:
- ADMIN_EMAIL: The email of the admin account who owns the workspace that you'll be testing on
- USER_EMAIL: The email of the user who was invited to the admin's workspace
- MEMBER_EMAIL: The email of the member who was invited to the admin's workspace
- NON_MEMBER_EMAIL: The email of the user who was not invited to the admin's workspace
- MEMBER_TO_INVITE_EMAIL: The email of the user who will be invited to the admin's workspace
- TEST_PASSWORD: The password for all the test accounts

**NOTE:** When you setup your worker/dropbase-dev, make sure that the DROPBASE_TOKEN variable in the `.env` file is set to the token of the admin account. This is because the tests are set up to use the admin account to create the test apps.

### Setting up local environment
1. Make sure you have Cypress installed. If not, run `yarn add cypress --dev` to install it.
2. Run platform server locally. Cypress will expect the server to be running on `http://localhost:9000`
3. Run dropbase worker locally. Cypress will expect the worker to be running on `http://localhost:9090`
4. Run the client locally as well. Use `yarn start:dev` to start the client on `http://localhost:3000`
5. Run `yarn cypress open` to open the Cypress Test Runner. You can then run the tests from the runner.

### Navigating through Cypress
1.  Once the Cypress Test Runner is open, click on "E2E Testing"
2.  Click Chrome and then click on "E2E testing with Chrome"
3.  You will now see a list of "specs" that you can run. Click on any of the specs to run the tests.
4.

### Known Issues
- There may be an origin issue preventing the client from connecting to the worker. You might want to play around with the allowed origins in the worker's `main.py` file.
- When a test fails, the test app will not be deleted. You will have to manually delete the test app before running the tests again. You can do this by going to the "Apps" tab in the client and deleting the app with the name "cypresstestapp1" etc.
- When a test fails in the auth section, if a user is given a specific permission and the test fails after that, the user will still have that permission. You will have to manually remove the permission from the user in the client or the database

