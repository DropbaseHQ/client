import { useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { useGetWorkspaceApps } from '../app-list/hooks/useGetWorkspaceApps';
import { workspaceAtom } from '@/features/workspaces';
import { useGetWorkspaceUsers } from './hooks/workspace';
import { useGetUserDetails, useUpdateUserPolicy } from './hooks/user';
import {
	PermissionsFilterRow,
	PermissionsFilter,
	PermissionsSubLayout,
	PermissionsSubjectRow,
	PermissionsTable,
	PermissionsTableRow,
} from './PermissionsComponents';

const MemberTableRow = ({ name, userId, appId }: any) => {
	const { permissions } = useGetUserDetails({ userId });
	const { id: workspaceId } = useAtomValue(workspaceAtom);
	const policy = permissions?.find((item) => item.resource === appId);
	const updateUserPolicyMutation = useUpdateUserPolicy();

	const handleSelect = useCallback(
		(value: string) => {
			updateUserPolicyMutation.mutate({
				userId,
				resource: appId,
				action: value,
				workspaceId: workspaceId || '',
			});
		},
		[updateUserPolicyMutation, userId, appId, workspaceId],
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

export const MemberPermissions = () => {
	const { users } = useGetWorkspaceUsers();
	const { apps } = useGetWorkspaceApps();
	const [selectedUser, setSelectedUser] = useState('');
	const [appFilter, setAppFilter] = useState('');

	const filteredApps = apps?.filter((app) => app.name.includes(appFilter));

	const selectedUserInfo = users?.find((user: any) => user.id === selectedUser);

	const UsersList = () => {
		return users?.map((user: any) => (
			<PermissionsSubjectRow
				key={user.id}
				name={user.name}
				id={user.id}
				isSelected={selectedUser === user.id}
				onClick={setSelectedUser}
			/>
		));
	};

	const MemberTableRowsList = () => {
		return filteredApps?.map((app: any) => (
			<MemberTableRow key={app.id} name={app.name} groupId={selectedUser} appId={app.id} />
		));
	};

	const MemberTable = () => {
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
				<PermissionsTable subjectName="Users" tableRows={<MemberTableRowsList />} />
			</>
		);
	};

	return (
		<PermissionsSubLayout
			list={<UsersList />}
			table={<MemberTable />}
			selectedName={selectedUserInfo?.name}
		/>
	);
};
