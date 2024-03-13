import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalFooter,
	ModalBody,
	ModalCloseButton,
	Button,
	FormControl,
	FormLabel,
	Divider,
	VStack,
	Text,
	Badge,
	Flex,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { InputRenderer } from '@/components/FormInput';
import { getErrorMessage } from '@/utils';
import {
	useGetWorkspaceGroups,
	useGetWorkspaceUsers,
	useUpdateAppPolicy,
	GET_WORKSPACE_USERS_QUERY_KEY,
	GET_WORKSPACE_GROUPS_QUERY_KEY,
	useGetAppAccess,
} from '@/features/settings/hooks/workspace';
import { useToast } from '@/lib/chakra-ui';
import { useGetWorkspaceApps } from '@/features/app-list/hooks/useGetWorkspaceApps';

const AccessList = () => {
	const { userAccess, groupAccess } = useGetAppAccess();
	const { users } = useGetWorkspaceUsers();
	const { groups } = useGetWorkspaceGroups();

	const getTargetUser = useCallback(
		(userId: string) => {
			return users.find((user) => user.id === userId);
		},
		[users],
	);
	const getTargetGroup = useCallback(
		(groupId: string) => {
			return groups.find((group) => group.id === groupId);
		},
		[groups],
	);

	return (
		<VStack w="full">
			<Text mr="auto" fontWeight="medium">
				People with access
			</Text>
			{userAccess.map((accessObject) => {
				return (
					<Flex alignItems="center" justifyContent="space-between" w="full">
						<Text fontSize="sm">{getTargetUser(accessObject.id)?.email}</Text>
						<Text fontSize="xs" color="gray" textTransform="capitalize">
							{' '}
							{accessObject.permission}
						</Text>
					</Flex>
				);
			})}

			<Text mr="auto" mt="2" fontWeight="medium">
				Groups with access
			</Text>
			{groupAccess.map((accessObject) => {
				return (
					<Flex alignItems="center" justifyContent="space-between" w="full">
						<Text fontSize="sm">{getTargetGroup(accessObject.id)?.name}</Text>
						<Badge size="sm">{accessObject.permission}</Badge>
					</Flex>
				);
			})}
		</VStack>
	);
};

export const ShareModal = ({ isOpen, onClose }: any) => {
	const { users } = useGetWorkspaceUsers();
	const { groups } = useGetWorkspaceGroups();
	const { apps } = useGetWorkspaceApps();
	const { appName } = useParams();
	const toast = useToast();
	const queryClient = useQueryClient();

	const [invitees, setInvitees] = useState<any[]>([]);
	const [action, setAction] = useState('');

	const currentApp = apps?.find((app: any) => app.name === appName);

	const updateAppPolicyMutation = useUpdateAppPolicy({
		onSuccess: () => {
			toast({
				title: 'App shared',
				status: 'success',
			});
			queryClient.invalidateQueries(GET_WORKSPACE_USERS_QUERY_KEY);
			queryClient.invalidateQueries(GET_WORKSPACE_GROUPS_QUERY_KEY);
			onClose();
		},
		onError: (error: any) => {
			toast({
				title: 'Failed to share app',
				status: 'error',
				description: getErrorMessage(error),
			});
		},
	});
	const formattedUsers = users
		.filter((user) => user.role_name === 'member' || user.role_name === 'user')
		.map((user: any) => ({
			name: user.email,
			value: user.id,
		}));

	const formattedGroups = groups.map((group: any) => ({
		name: group.name,
		value: group.id,
	}));

	const inviteeOptions = [...formattedUsers, ...formattedGroups];

	const handleShare = async () => {
		updateAppPolicyMutation.mutate({
			appId: currentApp?.id || '',
			subjects: invitees,
			action,
		});
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Share this app</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<VStack spacing={4}>
						<FormControl>
							<FormLabel>Invitees</FormLabel>
							<InputRenderer
								label="Invitees"
								type="multiselect"
								options={inviteeOptions}
								value={invitees}
								onChange={(value: any) => {
									setInvitees(value);
								}}
							/>
						</FormControl>

						<FormControl>
							<FormLabel>Role</FormLabel>
							<InputRenderer
								type="select"
								value={action}
								onChange={(value: any) => {
									setAction(value);
								}}
								options={[
									{ name: 'Use', value: 'use' },
									{ name: 'Edit', value: 'edit' },
									{ name: 'Own', value: 'own' },
								]}
							/>
						</FormControl>
						<Divider />

						<AccessList />
					</VStack>
				</ModalBody>

				<ModalFooter>
					<Button variant="ghost">Cancel</Button>
					<Button
						colorScheme="blue"
						mr={3}
						onClick={handleShare}
						isLoading={updateAppPolicyMutation.isLoading}
					>
						Share
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
