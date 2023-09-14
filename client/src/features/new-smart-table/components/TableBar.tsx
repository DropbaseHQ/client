import { IconButton, Stack } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { Zap } from 'react-feather';
import { useConvertSmartTable } from '../hooks';
import { useToast } from '@/lib/chakra-ui';

export const TableBar = () => {
	const toast = useToast();
	const { tableId } = useParams();

	const mutation = useConvertSmartTable({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'SmartTable converted',
			});
		},
	});

	const handleConvert = () => {
		if (tableId)
			mutation.mutate({
				tableId,
			});
	};

	return (
		<Stack bg="white" borderBottomWidth="1px" direction="row" p="1">
			<IconButton
				aria-label="Convert to Smart table"
				icon={<Zap size="14" />}
				variant="outline"
				colorScheme="blue"
				size="sm"
				onClick={handleConvert}
				isLoading={mutation.isLoading}
			/>
		</Stack>
	);
};
