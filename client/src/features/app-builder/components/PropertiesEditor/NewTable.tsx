import { useParams } from 'react-router-dom';
import { Button } from '@chakra-ui/react';

import { Plus } from 'react-feather';
import { useToast } from '@/lib/chakra-ui';
import { useCreateTable } from '@/features/app-builder/hooks';
import { useGetPage } from '@/features/page';
import { generateSequentialName } from '@/utils';
import { useStatus } from '@/layout/StatusBar';

export const NewTable = (props: any) => {
	const { pageId } = useParams();
	const { isConnected } = useStatus();
	const { tables } = useGetPage(pageId);
	const toast = useToast();

	const mutation = useCreateTable({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Table created',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Create table failed',
				description:
					error?.response?.data?.error || error?.response?.data || error?.message || '',
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
