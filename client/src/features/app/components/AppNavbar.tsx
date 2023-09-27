import { Text, IconButton, Stack, Tooltip } from '@chakra-ui/react';
import { ArrowLeft, Eye, EyeOff } from 'react-feather';
import { Link, useParams } from 'react-router-dom';
import { DropbaseIcon } from '@/components/Logo';
import { useGetWorkspaceApps } from '@/features/app-list/hooks/useGetWorkspaceApps';

export const AppNavbar = ({ isPreview }: any) => {
	const { appId } = useParams();
	const { apps } = useGetWorkspaceApps();

	const app = apps.find((a) => a.id === appId);

	return (
		<Stack
			alignItems="center"
			h="12"
			borderBottomWidth="1px"
			spacing="1"
			direction="row"
			bg="white"
		>
			<DropbaseIcon
				icon={<ArrowLeft size="16" />}
				w="11"
				h="12"
				colorScheme="gray"
				overflow="hidden"
				as={Link}
				to="/apps"
				borderRadius="0"
				variant="ghost"
			/>
			<Text fontWeight="semibold" fontSize="lg">
				{app?.name}
			</Text>
			<Tooltip label={isPreview ? 'App preview' : 'App Studio'}>
				<IconButton
					size="sm"
					variant="ghost"
					colorScheme="blue"
					icon={isPreview ? <EyeOff size="14" /> : <Eye size="14" />}
					aria-label="Preview"
					ml="auto"
					mr="4"
					as={Link}
					to={isPreview ? '../new-editor' : '../new-preview'}
				/>
			</Tooltip>
		</Stack>
	);
};
