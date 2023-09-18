import { Skeleton, Stack } from '@chakra-ui/react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { useInitPage } from '@/features/new-page';
import { PanelHandle } from '@/components/Panel';
import { NewAppPreview } from '@/features/new-app-preview';
import { NewSmartTable } from '@/features/new-smart-table';

export const NewApp = () => {
	const { isLoading } = useInitPage();

	if (isLoading) {
		return <Skeleton h="container.sm" p="6" />;
	}

	return (
		<Stack spacing="0" h="full">
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
