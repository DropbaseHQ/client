import { useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { useGetWorkspaceApps } from '../app-list/hooks/useGetWorkspaceApps';
import { workspaceAtom } from '@/features/workspaces';
import { useGetWorkspaceGroups, useGetWorkspaceUsers } from './hooks/workspace';
import { useGetUserDetails, useUpdateUserPolicy } from './hooks/user';
import {
	PermissionsFilterRow,
	PermissionsFilter,
	PermissionsSubLayout,
	PermissionsSubjectRow,
	PermissionsTable,
	PermissionsTableRow,
} from './PermissionsComponents';

import { useUpdateGroupPolicy, useGetGroup } from './hooks/group';

const UserTableRow = ({ name, subjectId, appId }: any) => {
	const { permissions } = useGetUserDetails({ userId: subjectId });
	const { id: workspaceId } = useAtomValue(workspaceAtom);
	const policy = permissions?.find((item) => item.resource === appId);
	const updateUserPolicyMutation = useUpdateUserPolicy();

	const handleSelect = useCallback(
		(value: string) => {
			updateUserPolicyMutation.mutate({
				userId: subjectId,
				resource: appId,
				action: value,
				workspaceId: workspaceId || '',
			});
		},
		[updateUserPolicyMutation, subjectId, appId, workspaceId],
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

const GroupTableRow = ({ name, subjectId, appId }: any) => {
	const { permissions } = useGetGroup({ groupId: subjectId });
	const policy = permissions?.find((item) => item.resource === appId);
	const updateGroupPolicyMutation = useUpdateGroupPolicy();

	const handleSelect = useCallback(
		(value: string) => {
			updateGroupPolicyMutation.mutate({
				groupId: subjectId,
				resource: appId,
				action: value,
			});
		},
		[updateGroupPolicyMutation, subjectId, appId],
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

export const AppPermissions = () => {
	const { users } = useGetWorkspaceUsers();
	const { groups } = useGetWorkspaceGroups();
	const { apps } = useGetWorkspaceApps();
	const [selectedApp, setSelectedApp] = useState('');
	const [appFilter, setAppFilter] = useState('');

	const formattedGroups = groups.map((group: any) => ({
		name: group.name,
		id: group.id,
		type: 'group',
	}));
	const formattedUsers = users.map((user: any) => ({
		name: user.name,
		id: user.id,
		type: 'user',
	}));

	const combinedList = formattedGroups.concat(formattedUsers);

	const selectedAppInfo = apps?.find((app: any) => app.id === selectedApp);

	const AppList = () => {
		return apps?.map((app) => (
			<PermissionsSubjectRow
				key={app.id}
				name={app.name}
				id={app.id}
				isSelected={selectedApp === app.id}
				onClick={setSelectedApp}
			/>
		));
	};
	const AppTableRowsList = () => {
		return combinedList.map((subject) => {
			if (subject.type === 'user') {
				return (
					<UserTableRow
						key={subject.id}
						name={subject.name}
						subjectId={subject.id}
						appId={selectedApp}
					/>
				);
			}
			if (subject.type === 'group') {
				return (
					<GroupTableRow
						key={subject.id}
						name={subject.name}
						subjectId={subject.id}
						appId={selectedApp}
					/>
				);
			}
			return null;
		});
	};

	const AppTable = () => {
		return (
			<>
				<PermissionsFilterRow>
					<PermissionsFilter
						name="Subject"
						operator=""
						value={appFilter}
						onChange={(e) => setAppFilter(e.target.value)}
					/>
				</PermissionsFilterRow>
				<PermissionsTable subjectName="Subject" tableRows={<AppTableRowsList />} />
			</>
		);
	};

	return (
		<PermissionsSubLayout
			list={<AppList />}
			table={<AppTable />}
			selectedName={selectedAppInfo?.name}
		/>
	);
};
