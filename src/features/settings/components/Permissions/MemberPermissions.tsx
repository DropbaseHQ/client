import { User } from 'react-feather';
import { Spinner } from '@chakra-ui/react';
import { useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { useGetWorkspaceApps } from '../../../app-list/hooks/useGetWorkspaceApps';
import { workspaceAtom } from '@/features/workspaces';
import { useGetWorkspaceUsers } from '../../hooks/workspace';
import { useGetUserDetails, useUpdateUserPolicy } from '../../hooks/user';
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

const UsersList = ({
	selectedUser,
	setSelectedUser,
}: {
	selectedUser: string;
	setSelectedUser: (value: string) => void;
}) => {
	const { isLoading, users } = useGetWorkspaceUsers();

	if (isLoading) {
		return <Spinner />;
	}

	return users?.map((user: any) => (
		<PermissionsSubjectRow
			key={user.id}
			name={user.name}
			Icon={User}
			id={user.id}
			isSelected={selectedUser === user.id}
			onClick={setSelectedUser}
		/>
	));
};

const MemberTableRowsList = ({
	selectedUser,
	appFilter,
}: {
	selectedUser: string;
	appFilter: string;
}) => {
	const { apps } = useGetWorkspaceApps();

	const filteredApps = apps?.filter(
		(app) => app.name?.toLowerCase().includes(appFilter?.toLowerCase()),
	);

	return filteredApps?.map((app: any) => (
		<MemberTableRow key={app.name} name={app.name} userId={selectedUser} appId={app.id} />
	));
};

const MemberTable = ({ selectedUser }: { selectedUser: string }) => {
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
				subjectName="Users"
				tableRows={
					<MemberTableRowsList selectedUser={selectedUser} appFilter={appFilter} />
				}
			/>
		</>
	);
};

export const MemberPermissions = () => {
	const { users } = useGetWorkspaceUsers();
	const [selectedUser, setSelectedUser] = useState('');

	const selectedUserInfo = users?.find((user: any) => user.id === selectedUser);

	return (
		<PermissionsSubLayout
			list={<UsersList selectedUser={selectedUser} setSelectedUser={setSelectedUser} />}
			table={<MemberTable selectedUser={selectedUser} />}
			selectedName={selectedUserInfo?.name}
		/>
	);
};
