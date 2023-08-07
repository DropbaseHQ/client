module.exports = {
	root: true,
	env: { browser: true, es2020: true, jest: true },
	extends: [
		'airbnb',
		'airbnb/hooks',
		'airbnb-typescript',
		'plugin:@typescript-eslint/recommended',
		'prettier',
	],
	ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.ts'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json',
	},
	plugins: ['react-refresh', 'import', '@typescript-eslint', 'prettier'],
	rules: {
		'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
		'prettier/prettier': ['error'],

		'import/prefer-default-export': 'off',

		'arrow-body-style': 'off',

		'react/jsx-no-useless-fragment': 'off',
		'react/require-default-props': 'warn',
		'react/no-array-index-key': 'warn',
		'react/jsx-uses-react': 'off',
		'react/react-in-jsx-scope': 'off',
		'react/function-component-definition': 'off',
		'react/jsx-props-no-spreading': 'off',
		'react/no-unstable-nested-components': 'off',
	},
};
