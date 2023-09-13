import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';

import { TableProperties } from './TableProperties';
import { Columns } from './ColumnProperties';
import { WidgetProperties } from './WidgetProperties';
import { Components } from './ComponentEditor';
import { FunctionEditor } from './FunctionEditor';
import { NewFunction } from './Functions';
import { usePageFunctions } from '@/features/new-app-builder/hooks';
import { pageAtom } from '@/features/new-page';

export const PropertiesEditor = () => {
	const { pageId } = useParams();
	const { functions } = usePageFunctions(pageId || '');

	const { widgetId } = useAtomValue(pageAtom);

	return (
		<Tabs isLazy h="full" overflowY="auto">
			<TabList bg="white" borderBottomWidth="1px">
				<Tab>Table</Tab>
				<Tab>Columns</Tab>
				<Tab isDisabled={!widgetId}>Widget</Tab>
				<Tab isDisabled={!widgetId}>Components</Tab>

				{functions.map((f: any) => (
					<Tab key={f.id}>{f.name}</Tab>
				))}

				<NewFunction />
			</TabList>
			<TabPanels>
				<TabPanel>
					<TableProperties />
				</TabPanel>
				<TabPanel>
					<Columns />
				</TabPanel>
				<TabPanel>
					<WidgetProperties />
				</TabPanel>
				<TabPanel>
					<Components />
				</TabPanel>

				{functions.map((f: any) => (
					<TabPanel key={f.id}>
						<FunctionEditor id={f.id} />
					</TabPanel>
				))}
			</TabPanels>
		</Tabs>
	);
};
