import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

import { Heading, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

const MarkdownEditor = ({ text }: { text: string }) => {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm, remarkBreaks]}
			components={{
				h1: (componentProps) => <Heading as="h1" size="2xl" {...componentProps} />,
				h2: (componentProps) => <Heading as="h2" size="xl" {...componentProps} />,
				h3: (componentProps) => <Heading as="h3" size="lg" {...componentProps} />,
				h4: (componentProps) => <Heading as="h4" size="md" {...componentProps} />,
				h5: (componentProps) => <Heading as="h5" size="sm" {...componentProps} />,
				h6: (componentProps) => <Heading as="h6" size="xs" {...componentProps} />,
				a: (componentProps) => (
					<a
						style={{ color: '#007bff', textDecoration: 'underline' }}
						{...componentProps}
					>
						{componentProps.children}
					</a>
				),
				em: (componentProps) => <i style={{ fontWeight: 'bold' }} {...componentProps} />,
				table: (componentProps) => <Table variant="simple" {...componentProps} />,
				thead: (componentProps) => <Thead {...componentProps} />,
				tbody: (componentProps) => <Tbody {...componentProps} />,
				tr: (componentProps) => <Tr {...componentProps} />,
				th: (componentProps) => <Th borderWidth="1px" {...componentProps} />,
				td: (componentProps) => <Td borderWidth="1px" {...componentProps} />,
			}}
		>
			{text}
		</ReactMarkdown>
	);
};

export default MarkdownEditor;
