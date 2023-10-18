import { useEffect, useState } from 'react';
import { Box, Text, Select, Skeleton } from '@chakra-ui/react';
import { useGetUserDetails, useUpdateUserPolicy } from './hooks/user';
import { workspaceAtom } from '@/features/workspaces';
import { useAtomValue } from 'jotai';

export const UserPolicySelector = ({ userId, appId }: { userId: string; appId: string }) => {
	const workspaceId = useAtomValue<string>(workspaceAtom);
	const [option, setOption] = useState<string>('none');
	const updateUserPolicyMutation = useUpdateUserPolicy();
	const { permissions, isLoading: permissionsIsLoading } = useGetUserDetails({
		userId,
		workspaceId,
	});
	const policy = permissions?.find((item) => item.resource === appId);

	useEffect(() => {
		setOption(policy?.action || 'none');
	}, [policy]);

	const handleSelect = (e: any) => {
		setOption(e.target.value);
		updateUserPolicyMutation.mutate({
			workspaceId,
			userId,
			resource: appId,
			action: e.target.value,
		});
	};

	return (
		<Skeleton isLoaded={!permissionsIsLoading}>
			<Select onChange={handleSelect} value={option}>
				<option value="none">None</option>
				<option value="use">Use</option>
				<option value="edit">Edit</option>
				<option value="own">Own</option>
			</Select>
		</Skeleton>
	);
};
export const UserCard = ({
	selectedUser,
	setSelectedUser,
	user,
}: {
	selectedUser: string;
	setSelectedUser: any;
	user: any;
}) => {
	return (
		<Box
			key={user.id}
			p={3}
			borderWidth="2px"
			borderRadius="lg"
			boxShadow={selectedUser === user.id ? 'sm' : 'md'}
			_hover={{ cursor: 'pointer' }}
			borderColor={selectedUser === user.id ? 'blue.500' : 'gray.200'}
			onClick={() => setSelectedUser(user.id)}
			display="flex"
			justifyContent="space-between"
		>
			<Text fontSize="xl" fontWeight="bold">
				{user.email}
			</Text>
		</Box>
	);
};
