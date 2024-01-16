import { useParams } from 'react-router-dom';
import { Button } from '@chakra-ui/react';
import { useSetAtom } from 'jotai';

import { Plus } from 'react-feather';
import { useToast } from '@/lib/chakra-ui';
import { useGetPage, useUpdatePageData } from '@/features/page';
import { generateSequentialName, getErrorMessage } from '@/utils';
import { useStatus } from '@/layout/StatusBar';
import { inspectedResourceAtom } from '../../atoms';

export const NewTable = (props: any) => {
	const { appName, pageName } = useParams();
	const { isConnected } = useStatus();
	const { tables, properties } = useGetPage({ appName, pageName });
	const toast = useToast();

	const setInspectedResource = useSetAtom(inspectedResourceAtom);

	const mutation = useUpdatePageData({
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

	const onSubmit = () => {
		const { name: nextName, label: nextLabel } = generateSequentialName({
			currentNames: tables.map((t: any) => t.name) || [],
			prefix: 'table',
		});

		mutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: {
				...(properties || {}),
				tables: [
					...(properties?.tables || []),
					{
						name: nextName,
						label: nextLabel,
						type: 'sql',
						columns: [],
					},
				],
			},
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
