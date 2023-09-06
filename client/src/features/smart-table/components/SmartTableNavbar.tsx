import { useParams, useNavigate } from 'react-router-dom';
import { Flex, IconButton, Stack, Text, Button } from '@chakra-ui/react';
import { ArrowLeft } from 'react-feather';
import { useGetPage } from '@/features/app/hooks';

export const SmartTableNavbar = () => {
	const { pageId } = useParams();
	const { isLoading, page } = useGetPage(pageId || '');
	const navigate = useNavigate();

	return (
		<Stack alignItems="center" shadow="xs" h="10" borderBottomWidth="1px" direction="row">
			<Flex h="full" w="full" alignItems="center">
				<IconButton
					isLoading={isLoading}
					aria-label="Go back to Apps"
					icon={<ArrowLeft size="14" />}
					borderRadius="0"
					variant="ghost"
					h="full"
					colorScheme="gray"
					borderRightWidth="1px"
					onClick={() => {
						navigate(`/apps`);
					}}
				/>

				<Text fontSize="sm" fontWeight="medium" marginLeft="2">
					{page?.name}
				</Text>
				<Button
					variant="solid"
					ml="auto"
					mr="4"
					size="xs"
					onClick={() => {
						navigate(`editor`);
					}}
				>
					Editor
				</Button>
			</Flex>
		</Stack>
	);
};
