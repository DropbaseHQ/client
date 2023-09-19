import { Panel, PanelGroup } from 'react-resizable-panels';
import { PanelHandle } from '@/components/Panel';
import { ColumnsProperties } from './ColumnProperties';
import { TableProperties } from './TableProperties';

export const TableConfig = () => {
	return (
		<PanelGroup direction="horizontal">
			<Panel defaultSize={65}>
				<TableProperties />
			</Panel>
			<PanelHandle direction="vertical" />
			<Panel>
				<ColumnsProperties />
			</Panel>
		</PanelGroup>
	);
};
