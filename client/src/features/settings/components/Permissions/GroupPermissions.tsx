import { Users } from 'react-feather';
import { Spinner } from '@chakra-ui/react';
import { useState, useCallback } from 'react';
import { useGetWorkspaceApps } from '../../../app-list/hooks/useGetWorkspaceApps';
import {
	PermissionsFilterRow,
	PermissionsFilter,
	PermissionsSubLayout,
	PermissionsSubjectRow,
	PermissionsTable,
	PermissionsTableRow,
} from './PermissionsComponents';
import { useGetWorkspaceGroups } from '../../hooks/workspace';
import { useGetGroup, useUpdateGroupPolicy } from '../../hooks/group';

const GroupTableRow = ({ name, groupId, appId }: any) => {
	const { permissions } = useGetGroup({ groupId });
	const policy = permissions?.find((item) => item.resource === appId);
	const updateGroupPolicyMutation = useUpdateGroupPolicy();

	const handleSelect = useCallback(
		(value: string) => {
			updateGroupPolicyMutation.mutate({
				groupId,
				resource: appId,
				action: value,
			});
		},
		[updateGroupPolicyMutation, groupId, appId],
	);
	return (
		<PermissionsTableRow
			key={appId}
			name={name}
			initialValue={policy?.action}
			handleSelect={handleSelect}
		/>
	);
};

const GroupList = ({
	selectedGroup,
	setSelectedGroup,
}: {
	selectedGroup: string;
	setSelectedGroup: (value: string) => void;
}) => {
	const { isLoading, groups } = useGetWorkspaceGroups();

	if (isLoading) {
		return <Spinner />;
	}

	return groups?.map((group) => (
		<PermissionsSubjectRow
			key={group.id}
			Icon={Users}
			name={group.name}
			id={group?.id}
			isSelected={selectedGroup === group.id}
			onClick={setSelectedGroup}
		/>
	));
};

const GroupTableRowsList = ({
	selectedGroup,
	appFilter,
}: {
	selectedGroup: string;
	appFilter: string;
}) => {
	const { apps } = useGetWorkspaceApps();

	const filteredApps = apps?.filter((app) => app.name.includes(appFilter));

	return filteredApps?.map((app: any) => (
		<GroupTableRow key={app.name} name={app.name} groupId={selectedGroup} appId={app.id} />
	));
};

const GroupTable = ({ selectedGroup }: { selectedGroup: string }) => {
	const [appFilter, setAppFilter] = useState('');
	return (
		<>
			<PermissionsFilterRow>
				<PermissionsFilter
					name="App"
					operator="="
					value={appFilter}
					onChange={setAppFilter}
				/>
			</PermissionsFilterRow>
			<PermissionsTable
				subjectName="Apps"
				tableRows={
					<GroupTableRowsList selectedGroup={selectedGroup} appFilter={appFilter} />
				}
			/>
		</>
	);
};

export const GroupPermissions = () => {
	const { groups } = useGetWorkspaceGroups();

	const [selectedGroup, setSelectedGroup] = useState('');

	const selectedGroupInfo = groups?.find((group) => group.id === selectedGroup);

	return (
		<PermissionsSubLayout
			list={<GroupList selectedGroup={selectedGroup} setSelectedGroup={setSelectedGroup} />}
			table={selectedGroup ? <GroupTable selectedGroup={selectedGroup} /> : null}
			selectedName={selectedGroupInfo?.name}
		/>
	);
};
