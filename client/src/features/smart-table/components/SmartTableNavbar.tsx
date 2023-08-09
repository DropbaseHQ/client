import { useParams } from 'react-router-dom';
import { Flex, IconButton, Stack, Text } from '@chakra-ui/react';
import { ArrowLeft } from 'react-feather';

import { useGetApp } from '@/features/app/hooks';

export const SmartTableNavbar = () => {
	const { appId } = useParams();
	const { isLoading, app } = useGetApp(appId || '');

	return (
		<Stack alignItems="center" shadow="xs" h="10" borderBottomWidth="1px" direction="row">
			<Flex h="full" alignItems="center">
				<IconButton
					isLoading={isLoading}
					aria-label="Go back to Apps"
					icon={<ArrowLeft size="14" />}
					borderRadius="0"
					variant="ghost"
					h="full"
					colorScheme="gray"
					borderRightWidth="1px"
				/>

				<Text fontSize="sm" fontWeight="medium" marginLeft="2">
					{app?.name}
				</Text>
			</Flex>
		</Stack>
	);
};
