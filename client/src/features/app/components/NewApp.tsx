import { Skeleton, Button, IconButton, Stack, Tooltip } from '@chakra-ui/react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { Link } from 'react-router-dom';
import { ArrowLeft, EyeOff } from 'react-feather';

import { useInitPage } from '@/features/new-page';
import { PanelHandle } from '@/components/Panel';
import { NewAppPreview } from '@/features/new-app-preview';
import { NewSmartTable } from '@/features/new-smart-table';
import { DropbaseLogo } from '@/components/Logo';

const Navbar = () => {
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
					icon={<EyeOff size="14" />}
					aria-label="Preview"
					ml="auto"
					mr="4"
					as={Link}
					to="../new-editor"
				/>
			</Tooltip>
		</Stack>
	);
};

export const NewApp = () => {
	const { isLoading } = useInitPage();

	if (isLoading) {
		return <Skeleton h="container.sm" p="6" />;
	}

	return (
		<Stack spacing="0" h="full">
			<Navbar />
			<PanelGroup direction="horizontal">
				<Panel defaultSize={80}>
					<NewSmartTable />
				</Panel>
				<PanelHandle direction="vertical" />
				<Panel>
					<NewAppPreview />
				</Panel>
			</PanelGroup>
		</Stack>
	);
};
