export const PROPERTIES = ['_protected', '_key', '_gte'];

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

export const databaseSchema = {
	schema: {
	  public: {

	  },

	},
	metadata: {

	}
};
