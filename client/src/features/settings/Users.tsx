import { useEffect, useState } from 'react';
import { Box, Text, Switch } from '@chakra-ui/react';

import { useUpdateUserPolicy } from './hooks/useUpdateUserPolicy';
import { useGetUserDetails } from './hooks/useGetUserDetails';
import { workspaceAtom } from '@/features/workspaces';
import { useAtomValue } from 'jotai';

export const UserPolicyToggle = ({
	userId,
	appId,
	action,
}: {
	userId: string;
	appId: string;
	action: string;
}) => {
	const workspaceId = useAtomValue<string>(workspaceAtom);
	const [isChecked, setIsChecked] = useState(false);
	const updateUserPolicyMutation = useUpdateUserPolicy();
	const { permissions } = useGetUserDetails({ userId, workspaceId });
	const policy = permissions?.find((item) => item.resource === appId && item.action === action);

	useEffect(() => {
		setIsChecked(policy ? true : false);
	}, [policy]);

	const handleToggle = () => {
		setIsChecked(!isChecked);
		updateUserPolicyMutation.mutate({
			workspaceId,
			userId,
			resource: appId,
			action,
			effect: isChecked ? 'deny' : 'allow',
		});
	};

	return <Switch isChecked={isChecked} onChange={handleToggle} size="md" colorScheme="blue" />;
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
			key={user.user_id}
			p={3}
			borderWidth="2px"
			borderRadius="lg"
			boxShadow={selectedUser === user.user_id ? 'sm' : 'md'}
			_hover={{ cursor: 'pointer' }}
			borderColor={selectedUser === user.user_id ? 'blue.500' : 'gray.200'}
			onClick={() => setSelectedUser(user.user_id)}
			display="flex"
			justifyContent="space-between"
		>
			<Text fontSize="xl" fontWeight="bold">
				{user.email}
			</Text>
		</Box>
	);
};
