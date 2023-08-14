import { Box } from '@chakra-ui/react';
import Editor, { useMonaco } from '@monaco-editor/react';

import { useMonacoTheme } from '@/components/Editor/hooks/useMonacoTheme';

const sampleData = {
	$id: 'https://example.com/arrays.schema.json',
	$schema: 'https://json-schema.org/draft/2020-12/schema',
	description: 'A representation of a person, company, organization, or place',
	type: 'object',
	properties: {
		fruits: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
		vegetables: {
			type: 'array',
			items: { $ref: '#/$defs/veggie' },
		},
	},
	$defs: {
		veggie: {
			type: 'object',
			required: ['veggieName', 'veggieLike'],
			properties: {
				veggieName: {
					type: 'string',
					description: 'The name of the vegetable.',
				},
				veggieLike: {
					type: 'boolean',
					description: 'Do I like this vegetable?',
				},
			},
		},
	},
};

export const UIState = () => {
	const monaco = useMonaco();

	useMonacoTheme(monaco);

	return (
		<Box w="full" h="full">
			<Editor
				height="100%"
				options={{ readOnly: true, minimap: { enabled: false } }}
				language="json"
				value={JSON.stringify(sampleData, null, 4)}
			/>
		</Box>
	);
};
