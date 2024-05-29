import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

import { Heading, Table, Thead, Tbody, Tr, Th, Td, Box, Text } from '@chakra-ui/react';

const MarkdownEditor = ({ text, color }: { text: string; color: any }) => {
	const finalColor = color || `${color}.500`;

	return (
		<ReactMarkdown
			// remarkGfm adds a few more features e.g strikethroughs, tables, checkmarks
			remarkPlugins={[remarkGfm, remarkBreaks]}
			components={{
				h1: (componentProps) => (
					<Heading color={finalColor} as="h1" size="2xl" {...componentProps} />
				),
				h2: (componentProps) => (
					<Heading color={finalColor} as="h2" size="xl" {...componentProps} />
				),
				h3: (componentProps) => (
					<Heading color={finalColor} as="h3" size="lg" {...componentProps} />
				),
				h4: (componentProps) => (
					<Heading color={finalColor} as="h4" size="md" {...componentProps} />
				),
				h5: (componentProps) => (
					<Heading color={finalColor} as="h5" size="sm" {...componentProps} />
				),
				h6: (componentProps) => (
					<Heading color={finalColor} as="h6" size="xs" {...componentProps} />
				),
				a: (componentProps) => (
					<Box as="a" color="blue.500" textDecoration="underline" {...componentProps}>
						{componentProps.children}
					</Box>
				),
				p: (componentProps) => <Text color={finalColor} {...componentProps} />,
				em: (componentProps) => <i style={{ fontWeight: 'bold' }} {...componentProps} />,
				table: (componentProps) => (
					<Table color={finalColor} variant="simple" {...componentProps} />
				),
				thead: (componentProps) => <Thead {...componentProps} />,
				tbody: (componentProps) => <Tbody {...componentProps} />,
				tr: (componentProps) => <Tr {...componentProps} />,
				th: (componentProps) => <Th borderWidth="1px" {...componentProps} />,
				td: (componentProps) => <Td borderWidth="1px" {...componentProps} />,
				li: (componentProps) => <Box as="li" {...componentProps} />,
				ol: (componentProps) => <Box as="ol" px="4" ml="2" {...componentProps} />,
				ul: (componentProps) => <Box as="ul" px="4" ml="2" {...componentProps} />,
			}}
		>
			{text}
		</ReactMarkdown>
	);
};

export default MarkdownEditor;
