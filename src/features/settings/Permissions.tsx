import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import { GroupPermissions } from './components/Permissions/GroupPermissions';
import { MemberPermissions } from './components/Permissions/MemberPermissions';
import { AppPermissions } from './components/Permissions/AppPermissions';
import { PageLayout } from '@/layout';

const panelProps = {
	p: 0,
	h: 'full',
};

export const Permissions = () => {
	return (
		<PageLayout title="Permissions" pageProps={{ px: '0', pb: 0 }} titleProps={{ px: 6 }}>
			<Tabs flex="1" borderTopWidth="1px" defaultIndex={0}>
				<TabList h="32px" borderBottomWidth="1px">
					<Tab>Groups</Tab>
					<Tab>Members</Tab>
					<Tab>Apps</Tab>
				</TabList>

				<TabPanels h="calc(100% - 32px)" borderWidth="0">
					<TabPanel {...panelProps}>
						<GroupPermissions />
					</TabPanel>
					<TabPanel {...panelProps}>
						<MemberPermissions />
					</TabPanel>
					<TabPanel {...panelProps}>
						<AppPermissions />
					</TabPanel>
				</TabPanels>
			</Tabs>
		</PageLayout>
	);
};
