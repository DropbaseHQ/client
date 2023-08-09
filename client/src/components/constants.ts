export const PROPERTIES = ['_protected', '_key', '_gte'];

export const THEME = {
	base: 'vs' as const,
	inherit: true,
	colors: {
		'editor.token.keyword': '#0000FF',
		'editor.token.string': '#A31515',
	},
	rules: [
		{
			token: 'comment',
			foreground: '#ffa500',
		},
		{ token: 'keyword', foreground: '#FF00FF' },
		{ token: 'string', foreground: '#A31515' },
	],
};

export const MONARCH_TOKENIZER = {
	tokenizer: {
		root: [
			// SQL keywords
			[
				/(SELECT|FROM|WHERE|ORDER BY|GROUP BY|JOIN|LEFT JOIN|RIGHT JOIN|ON|AND|OR|NOT|IN|BETWEEN|AS|WITH)\b/i,
				'keyword',
			],
			// SQL strings
			[/'[^']*'/, 'string'],
			[/`[^`]*`/, 'string'],
			[/"/, 'string', '@string_double'],
			// comments
			[/--.*/, 'comment'],
		],
		string_double: [
			[/[^\\"]+/, 'string'],
			[/"/, 'string', '@pop'],
		],
	},
};
