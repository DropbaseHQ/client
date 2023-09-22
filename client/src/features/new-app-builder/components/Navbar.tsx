import { Button, IconButton, Stack, Tooltip } from '@chakra-ui/react';
import { ArrowLeft, Eye } from 'react-feather';
import { Link } from 'react-router-dom';

import { DropbaseLogo } from '@/components/Logo';

export const AppBuilderNavbar = () => {
	return (
		<Stack alignItems="center" h="12" borderBottomWidth="1px" direction="row" bg="white">
			<DropbaseLogo p="2">
				<Button
					leftIcon={<ArrowLeft size="14" />}
					borderRadius="0"
					variant="ghost"
					as={Link}
					to="/apps"
					h="full"
					colorScheme="gray"
				>
					Back to Apps
				</Button>
			</DropbaseLogo>

			<Tooltip label="App preview">
				<IconButton
					size="sm"
					variant="ghost"
					colorScheme="blue"
					icon={<Eye size="14" />}
					aria-label="Preview"
					ml="auto"
					mr="4"
					as={Link}
					to="../new-preview"
				/>
			</Tooltip>
		</Stack>
	);
};
