import { useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import { Layout } from 'react-feather';
import { useGetWorkspaceApps } from '../../../app-list/hooks/useGetWorkspaceApps';
import { workspaceAtom } from '@/features/workspaces';
import { useGetWorkspaceGroups, useGetWorkspaceUsers } from '../../hooks/workspace';
import { useGetUserDetails, useUpdateUserPolicy } from '../../hooks/user';
import {
	PermissionsFilterRow,
	PermissionsFilter,
	PermissionsSubLayout,
	PermissionsSubjectRow,
	PermissionsTable,
	PermissionsTableRow,
} from './PermissionsComponents';

import { useUpdateGroupPolicy, useGetGroup } from '../../hooks/group';

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

const AppList = ({
	selectedApp,
	setSelectedApp,
}: {
	selectedApp: string;
	setSelectedApp: (value: string) => void;
}) => {
	const { apps } = useGetWorkspaceApps();

	return apps?.map((app) => (
		<PermissionsSubjectRow
			key={app.id}
			name={app.name}
			Icon={Layout}
			id={app.id}
			isSelected={selectedApp === app.id}
			onClick={setSelectedApp}
		/>
	));
};

const AppTableRowsList = ({
	selectedApp,
	subjectFilter,
}: {
	selectedApp: string;
	subjectFilter: string;
}) => {
	const { users } = useGetWorkspaceUsers();
	const { groups } = useGetWorkspaceGroups();

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
	const filteredCombinedList = combinedList.filter((subject) =>
		subject.name.includes(subjectFilter),
	);

	return filteredCombinedList.map((subject) => {
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

const AppTable = ({ selectedApp }: { selectedApp: string }) => {
	const [subjectFilter, setSubjectFilter] = useState('');

	return (
		<>
			<PermissionsFilterRow>
				<PermissionsFilter
					name="Subject"
					operator="="
					value={subjectFilter}
					onChange={setSubjectFilter}
				/>
			</PermissionsFilterRow>
			<PermissionsTable
				subjectName="Subject"
				tableRows={
					<AppTableRowsList selectedApp={selectedApp} subjectFilter={subjectFilter} />
				}
			/>
		</>
	);
};

export const AppPermissions = () => {
	const { apps } = useGetWorkspaceApps();
	const [selectedApp, setSelectedApp] = useState('');

	const selectedAppInfo = apps?.find((app: any) => app.id === selectedApp);

	return (
		<PermissionsSubLayout
			list={<AppList selectedApp={selectedApp} setSelectedApp={setSelectedApp} />}
			table={<AppTable selectedApp={selectedApp} />}
			selectedName={selectedAppInfo?.name}
		/>
	);
};
