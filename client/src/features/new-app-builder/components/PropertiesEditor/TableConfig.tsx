import { Stack, Text } from '@chakra-ui/react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { PanelHandle } from '@/components/Panel';
import { ColumnsProperties } from './ColumnProperties';
import { TableProperties } from './TableProperties';

export const TableConfig = () => {
	return (
		<Stack h="full" bg="white">
			<Text p="3" borderBottomWidth="1px" fontWeight="semibold" size="sm">
				Table Properties
			</Text>
			<PanelGroup direction="vertical">
				<Panel defaultSize={45}>
					<TableProperties />
				</Panel>
				<PanelHandle direction="horizontal" />
				<Panel>
					<ColumnsProperties />
				</Panel>
			</PanelGroup>
		</Stack>
	);
};
