import { useState, useCallback } from 'react';
import { useGetWorkspaceApps } from '../app-list/hooks/useGetWorkspaceApps';
import {
	PermissionsFilterRow,
	PermissionsFilter,
	PermissionsSubLayout,
	PermissionsSubjectRow,
	PermissionsTable,
	PermissionsTableRow,
} from './PermissionsComponents';
import { useGetWorkspaceGroups } from './hooks/workspace';
import { useGetGroup, useUpdateGroupPolicy } from './hooks/group';

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

export const GroupPermissions = () => {
	const { groups } = useGetWorkspaceGroups();
	const { apps } = useGetWorkspaceApps();

	const [selectedGroup, setSelectedGroup] = useState('');
	const [appFilter, setAppFilter] = useState('');

	const filteredApps = apps?.filter((app) => app.name.includes(appFilter));

	const selectedGroupInfo = groups?.find((group) => group.id === selectedGroup);

	const GroupList = () => {
		return groups?.map((group) => (
			<PermissionsSubjectRow
				key={group.id}
				name={group.name}
				id={group?.id}
				isSelected={selectedGroup === group.id}
				onClick={setSelectedGroup}
			/>
		));
	};

	const GroupTableRowsList = useCallback(() => {
		return filteredApps?.map((app) => (
			<GroupTableRow key={app.name} name={app.name} groupId={selectedGroup} appId={app.id} />
		));
	}, [filteredApps, selectedGroup]);

	const GroupTable = () => {
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
				<PermissionsTable subjectName="Apps" tableRows={<GroupTableRowsList />} />
			</>
		);
	};

	return (
		<PermissionsSubLayout
			list={<GroupList />}
			table={selectedGroup ? <GroupTable /> : null}
			selectedName={selectedGroupInfo?.name}
		/>
	);
};
