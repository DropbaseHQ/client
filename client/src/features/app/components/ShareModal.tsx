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
	Flex,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useState, useCallback, useMemo } from 'react';
import { InputRenderer } from '@/components/FormInput';
import { getErrorMessage } from '@/utils';
import {
	useGetWorkspaceGroups,
	useGetWorkspaceUsers,
	useUpdateAppPolicy,
	useGetAppAccess,
} from '@/features/settings/hooks/workspace';
import { useToast } from '@/lib/chakra-ui';
import { useGetWorkspaceApps } from '@/features/app-list/hooks/useGetWorkspaceApps';

const SubjectRow = ({
	identification,
	permission,
}: {
	identification: string;
	permission: string;
}) => {
	return (
		<Flex alignItems="center" justifyContent="space-between" w="full" px="2" py="1">
			<Text fontSize="sm">{identification}</Text>
			<Text fontSize="xs" color="gray" textTransform="capitalize">
				{permission}
			</Text>
		</Flex>
	);
};

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
			<Text mr="auto" fontSize="md" fontWeight="medium">
				People with access
			</Text>
			{userAccess?.map((accessObject) => {
				return (
					<SubjectRow
						key={accessObject.id}
						identification={getTargetUser(accessObject.id)?.email || ''}
						permission={accessObject.permission}
					/>
				);
			})}

			<Text mr="auto" mt="2" fontSize="md" fontWeight="medium">
				Groups with access
			</Text>
			{groupAccess?.map((accessObject) => {
				return (
					<SubjectRow
						key={accessObject.id}
						identification={getTargetGroup(accessObject.id)?.name || ''}
						permission={accessObject.permission}
					/>
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

	const [invitees, setInvitees] = useState<any[]>([]);
	const [action, setAction] = useState('');

	const currentApp = apps?.find((app: any) => app.name === appName);

	const updateAppPolicyMutation = useUpdateAppPolicy({
		onSuccess: () => {
			toast({
				title: 'App shared',
				status: 'success',
			});
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
	const formattedUsers = useMemo(() => {
		return users
			.filter((user) => user.role_name === 'member' || user.role_name === 'user')
			.map((user: any) => ({
				name: user.email,
				value: user.id,
			}));
	}, [users]);

	const formattedGroups = useMemo(() => {
		return groups.map((group: any) => ({
			name: group.name,
			value: group.id,
		}));
	}, [groups]);

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
					<Button variant="ghost" onClick={() => onClose()}>
						Cancel
					</Button>
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
