import { useParams } from 'react-router-dom';
import { IconButton } from '@chakra-ui/react';
import { Plus } from 'react-feather';
import { useSetAtom } from 'jotai';

import { useCreateFunction } from '@/features/new-app-builder/hooks';
import { useToast } from '@/lib/chakra-ui';
import { useGetPage } from '@/features/new-page';
import { developerTabAtom } from '@/features/new-app-builder/atoms';

export const NewFunction = (props: any) => {
	const toast = useToast();
	const { pageId } = useParams();
	const setDevTab = useSetAtom(developerTabAtom);

	const { functions } = useGetPage(pageId || '');

	const mutation = useCreateFunction({
		onSuccess: (data: any) => {
			setDevTab({
				id: data.id,
				type: 'function',
			});
			toast({
				status: 'success',
				title: 'Function created',
			});
		},
	});

	const handleAddFunction = () => {
		const currentNames = functions.map((c: any) => c.name);

		let nameIndex = 1;

		while (currentNames.includes(`function${nameIndex}`)) {
			nameIndex += 1;
		}

		const newName = `function${nameIndex}`;

		mutation.mutate({
			pageId,
			name: newName,
		});
	};

	return (
		<IconButton
			aria-label="Add function"
			icon={<Plus size="14" />}
			onClick={handleAddFunction}
			isLoading={mutation.isLoading}
			{...props}
		/>
	);
};
