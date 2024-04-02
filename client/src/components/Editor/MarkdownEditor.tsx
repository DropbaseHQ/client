import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

const MarkdownEditor = ({ text }: { text: string }) => {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm, remarkBreaks]}
			components={{
				h1: (componentProps) => (
					<div style={{ fontSize: '2em', fontWeight: 'bold' }} {...componentProps} />
				),
				h2: (componentProps) => (
					<div style={{ fontSize: '1.5em', fontWeight: 'bold' }} {...componentProps} />
				),
				h3: (componentProps) => (
					<div style={{ fontSize: '1.17em', fontWeight: 'bold' }} {...componentProps} />
				),
				h4: (componentProps) => (
					<div style={{ fontSize: '1em', fontWeight: 'bold' }} {...componentProps} />
				),
				h5: (componentProps) => (
					<div style={{ fontSize: '0.83em', fontWeight: 'bold' }} {...componentProps} />
				),
				h6: (componentProps) => (
					<div style={{ fontSize: '0.67em', fontWeight: 'bold' }} {...componentProps} />
				),
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
