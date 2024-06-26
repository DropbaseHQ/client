import { Button, Tooltip } from '@chakra-ui/react';
import { UploadCloud } from 'react-feather';
import { useParams } from 'react-router-dom';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { useSaveColumns } from '../hooks';

export const SaveColumns = ({ tableName, header, columnDict }: any) => {
	const toast = useToast();

	const mutation = useSaveColumns({
		onSuccess: () => {
			toast({
				title: 'Commited Columns details',
				status: 'success',
			});
		},
		onError: (err: any) => {
			toast({
				title: 'Failed to commit',
				status: 'error',
				description: getErrorMessage(err),
			});
		},
	});

	const { appName, pageName } = useParams();

	const handleCommitColumns = () => {
		mutation.mutate({
			appName,
			pageName,
			tableName,
			columns: header.map((c: any) => ({
				...(columnDict?.[c] || {}),
				...c,
			})),
		});
	};

	return (
		<Tooltip label="Save columns">
			<Button
				variant="outline"
				colorScheme="gray"
				leftIcon={<UploadCloud size="14" />}
				size="sm"
				flexShrink="0"
				onClick={handleCommitColumns}
				isLoading={mutation.isLoading}
			>
				Save Columns
			</Button>
		</Tooltip>
	);
};
