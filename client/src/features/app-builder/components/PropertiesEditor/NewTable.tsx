import { useParams } from 'react-router-dom';
import { Button } from '@chakra-ui/react';
import { useSetAtom } from 'jotai';

import { Plus } from 'react-feather';
import { useToast } from '@/lib/chakra-ui';
import { useCreateTable } from '@/features/app-builder/hooks';
import { useGetPage } from '@/features/page';
import { generateSequentialName, getErrorMessage } from '@/utils';
import { useStatus } from '@/layout/StatusBar';
import { inspectedResourceAtom } from '../../atoms';

export const NewTable = (props: any) => {
	const { pageId } = useParams();
	const { isConnected } = useStatus();
	const { tables } = useGetPage(pageId);
	const toast = useToast();

	const setInspectedResource = useSetAtom(inspectedResourceAtom);

	const mutation = useCreateTable({
		onSuccess: (data: any) => {
			toast({
				status: 'success',
				title: 'Table created',
			});
			setInspectedResource({
				id: data.id,
				type: 'table',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Create table failed',
				description: getErrorMessage(error),
			});
		},
	});

	const currentLastTable = tables[tables.length - 1];

	const onSubmit = () => {
		const nextName = generateSequentialName({
			currentNames: tables.map((t: any) => t.name) || [],
			prefix: 'table',
		});

		mutation.mutate({
			name: nextName,
			pageId,
			property: { appears_after: currentLastTable?.name },
		});
	};

	return (
		<Button
			aria-label="Add table"
			leftIcon={<Plus size="14" />}
			onClick={onSubmit}
			isLoading={mutation.isLoading}
			isDisabled={!isConnected}
			{...props}
		>
			New Table
		</Button>
	);
};
