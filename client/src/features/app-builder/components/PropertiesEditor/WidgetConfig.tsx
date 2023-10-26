import { Box } from '@chakra-ui/react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { WidgetProperties } from './WidgetProperties';
import { Components } from './ComponentEditor';
import { PanelHandle } from '@/components/Panel';

export const WidgetConfig = () => {
	return (
		<PanelGroup direction="horizontal">
			<Panel maxSize={50} defaultSize={35}>
				<Box p="3">
					<WidgetProperties />
				</Box>
			</Panel>
			<PanelHandle direction="vertical" />
			<Panel>
				<Box p="3" h="full">
					<Components />
				</Box>
			</Panel>
		</PanelGroup>
	);
};
