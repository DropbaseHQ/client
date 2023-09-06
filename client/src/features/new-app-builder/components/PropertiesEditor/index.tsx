import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';

import { TableProperties } from './TableProperties';
import { Columns } from './ColumnProperties';
import { WidgetProperties } from './WidgetProperties';
import { Components } from './ComponentEditor';

export const PropertiesEditor = () => {
	return (
		<Tabs h="full" overflowY="auto">
			<TabList bg="white" borderBottomWidth="1px">
				<Tab>Table</Tab>
				<Tab>Columns</Tab>
				<Tab>Widget</Tab>
				<Tab>Components</Tab>
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
			</TabPanels>
		</Tabs>
	);
};
