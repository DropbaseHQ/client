import { useState, useRef, useEffect } from 'react';
import { Edit, Trash2, Check } from 'react-feather';
import { Td, Tr, Input, Text, HStack, IconButton } from '@chakra-ui/react';
import { useDeleteURLMapping, useUpdateURLMapping } from '../hooks/urlMappings';

const EditableText = ({ inputProps, text, handleUpdate }: any) => {
	const [isEditing, setIsEditing] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		// Use a setTimeout to ensure that the input element is rendered before focusing
		if (isEditing) {
			setTimeout(() => {
				inputRef.current?.focus();
			}, 0);
		}
	}, [isEditing]);

	if (isEditing) {
		return (
			<Input
				ref={inputRef}
				variant="outline"
				size="sm"
				onBlur={() => setIsEditing(false)}
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						handleUpdate();
						setIsEditing(false);
					}
				}}
				{...inputProps}
			/>
		);
	}
	return (
		<HStack>
			<Text>{text}</Text>
			<IconButton
				aria-label="Edit name"
				size="xs"
				height="24px"
				width="24px"
				variant="ghost"
				onClick={(e) => {
					e.stopPropagation();
					setIsEditing(true);
				}}
				icon={<Edit size="12" />}
			/>
		</HStack>
	);
};

export const URLMappingRow = ({ urlMapping }: { urlMapping: any }) => {
	const mappingIsActive = window.location.href.includes(urlMapping?.client_url);
	const deleteMappingMutation = useDeleteURLMapping();
	const updateMappingMutation = useUpdateURLMapping();

	const [clientUrl, setClientUrl] = useState(urlMapping?.client_url);
	const [workerUrl, setWorkerUrl] = useState(urlMapping?.worker_url);
	const [workerWsUrl, setWorkerWsUrl] = useState(urlMapping?.worker_ws_url);

	const handleDeleteMapping = async () => {
		deleteMappingMutation.mutate({
			id: urlMapping.id,
		});
	};

	const handleUpdateMapping = async () => {
		updateMappingMutation.mutate({
			id: urlMapping.id,
			client_url: clientUrl,
			worker_url: workerUrl,
			worker_ws_url: workerWsUrl,
		});
	};

	return (
		<Tr>
			<Td>
				<EditableText
					inputProps={{
						value: clientUrl,
						onChange: (e: any) => setClientUrl(e.target.value),
					}}
					handleUpdate={handleUpdateMapping}
					text={urlMapping?.client_url}
				/>
			</Td>
			<Td>
				<EditableText
					inputProps={{
						value: workerUrl,
						onChange: (e: any) => setWorkerUrl(e.target.value),
					}}
					handleUpdate={handleUpdateMapping}
					text={urlMapping?.worker_url}
				/>
			</Td>
			<Td>
				<EditableText
					inputProps={{
						value: workerWsUrl,
						onChange: (e: any) => setWorkerWsUrl(e.target.value),
					}}
					handleUpdate={handleUpdateMapping}
					text={urlMapping?.worker_ws_url}
				/>
			</Td>
			<Td>
				<Check size="18" color={mappingIsActive ? 'green' : ''} />
			</Td>
			<Td>
				<IconButton
					aria-label="Delete token"
					size="xs"
					colorScheme="red"
					variant="outline"
					icon={<Trash2 size="14" />}
					onClick={(e) => {
						e.stopPropagation();
						handleDeleteMapping();
					}}
				/>
			</Td>
		</Tr>
	);
};
