import { Panel, PanelGroup } from 'react-resizable-panels';
import { PanelHandle } from '@/components/Panel';
import { WidgetProperties } from './WidgetProperties';
import { Components } from './ComponentEditor';

export const WidgetConfig = () => {
	return (
		<PanelGroup direction="horizontal">
			<Panel>
				<WidgetProperties />
			</Panel>
			<PanelHandle direction="vertical" />
			<Panel>
				<Components />
			</Panel>
		</PanelGroup>
	);
};
