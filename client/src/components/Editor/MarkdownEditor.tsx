import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

import { Heading } from '@chakra-ui/react';

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
				table: (componentProps) => (
					<table
						style={{ borderCollapse: 'collapse', width: '100%' }}
						{...componentProps}
					/>
				),
				th: (componentProps) => (
					<th
						style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}
						{...componentProps}
					/>
				),
				td: (componentProps) => (
					<td
						style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}
						{...componentProps}
					/>
				),
				tr: (componentProps) => (
					<tr style={{ backgroundColor: '#f9f9f9' }} {...componentProps} />
				),
			}}
		>
			{text}
		</ReactMarkdown>
	);
};

export default MarkdownEditor;
