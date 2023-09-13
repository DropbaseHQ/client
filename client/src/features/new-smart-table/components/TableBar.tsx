import { IconButton, Stack } from '@chakra-ui/react';
import { Zap } from 'react-feather';
import { useConvertSmartTable } from '../hooks';
import { useToast } from '@/lib/chakra-ui';

export const TableBar = () => {
	const toast = useToast();

	const mutation = useConvertSmartTable({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'SmartTable converted',
			});
		},
	});

	const handleConvert = () => {
		mutation.mutate({
			tableId: 'b37ba8d3-6f5f-47a0-9d98-d749ccb8d4a2',
		});
	};

	return (
		<Stack bg="white" borderBottomWidth="1px" direction="row" p="1">
			<IconButton
				aria-label="Convert to Smart table"
				icon={<Zap size="14" />}
				variant="ghost"
				colorScheme="blue"
				size="sm"
				onClick={handleConvert}
				isLoading={mutation.isLoading}
			/>
		</Stack>
	);
};
