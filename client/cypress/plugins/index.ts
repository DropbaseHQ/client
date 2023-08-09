import webpack from '@cypress/webpack-preprocessor';

module.exports = (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
	const options: webpack.Options = {
		webpackOptions: {
			module: {
				rules: [
					{
						test: /\.css$/,
						use: ['style-loader', 'css-loader'],
					},
				],
			},
		},
	};

	on('file:preprocessor', webpack(options));
};
