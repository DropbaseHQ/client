import { Panel, PanelGroup } from 'react-resizable-panels';
import { Box } from '@chakra-ui/react';
import { PanelHandle } from '@/components/Panel';
import { ColumnsProperties } from './ColumnProperties';
import { TableProperties } from './TableProperties';

export const TableConfig = () => {
	return (
		<PanelGroup direction="horizontal">
			<Panel defaultSize={65}>
				<Box p="3" m="3" bg="white" borderWidth="1px" borderRadius="sm">
					<TableProperties />
				</Box>
			</Panel>
			<PanelHandle direction="vertical" />
			<Panel>
				<ColumnsProperties />
			</Panel>
		</PanelGroup>
	);
};
