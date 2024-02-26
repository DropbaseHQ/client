export const PROPERTIES = ['_protected', '_key', '_gte'];

export const MONARCH_TOKENIZER = {
	tokenizer: {
		root: [
			// SQL keywords
			[
				/(SELECT|select|FROM|from|WHERE|where|ORDER BY|order by|GROUP BY|group by|JOIN|join|LEFT JOIN|left join|RIGHT JOIN|right join|ON|on|AND|and|OR|or|NOT|not|IN|in|BETWEEN|between|AS|as|WITH|with|returning|RETURNING)\b/i,
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

export const POSTGRES_SQL_KEYWORDS = [
	'SELECT',
	'FROM',
	'AS',
	'WHERE',
	'ORDER BY',
	'GROUP BY',
	'JOIN',
	'LEFT JOIN',
	'RIGHT JOIN',
	'ON',
	'AND',
	'OR',
	'NOT',
	'IN',
	'BETWEEN',
	'AS',
	'WITH',
	'RETURNING',
];

export const MYSQL_SQL_KEYWORDS = [
	'SELECT',
	'FROM',
	'AS',
	'WHERE',
	'ORDER BY',
	'GROUP BY',
	'JOIN',
	'LEFT JOIN',
	'RIGHT JOIN',
	'ON',
	'AND',
	'OR',
	'NOT',
	'IN',
	'BETWEEN',
	'AS',
	'WITH',
];

export const databaseSchema = {
	schema: {
		public: {},
	},
	metadata: {},
};
