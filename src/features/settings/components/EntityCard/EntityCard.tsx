import { useState } from 'react';
import { Trash } from 'react-feather';
import {
	Box,
	Text,
	Button,
	IconButton,
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverHeader,
	PopoverBody,
	PopoverFooter,
	PopoverArrow,
	PopoverCloseButton,
	ButtonGroup,
} from '@chakra-ui/react';
import { useQueryClient } from 'react-query';
import { GET_WORKSPACE_GROUPS_QUERY_KEY } from '../../hooks/workspace';
import { useDeleteGroup } from '../../hooks/group';

export const PermissionsCard = ({
	entity,
	children,
	isSelected = false,
	...props
}: {
	entity: any;
	children: React.ReactNode;
	isSelected?: boolean;
}) => {
	return (
		<Box
			key={entity.id}
			p={3}
			borderWidth="2px"
			borderRadius="lg"
			boxShadow={isSelected ? 'sm' : 'md'}
			_hover={{ cursor: 'pointer' }}
			borderColor={isSelected ? 'blue.500' : 'gray.200'}
			display="flex"
			justifyContent="space-between"
			{...props}
		>
			{children}
		</Box>
	);
};

export const UserCard = ({ isSelected, user }: { isSelected: boolean; user: any }) => {
	return (
		<PermissionsCard isSelected={isSelected} entity={user}>
			<Text>{user.email}</Text>
		</PermissionsCard>
	);
};

export const GroupCard = ({ isSelected, group }: { isSelected: boolean; group: any }) => {
	const [isDeletePopoverOpen, setDeletePopoverOpen] = useState(false);
	const queryClient = useQueryClient();
	const deleteGroupMutation = useDeleteGroup({
		onSuccess: () => {
			queryClient.invalidateQueries(GET_WORKSPACE_GROUPS_QUERY_KEY);
		},
	});

	const openDeletePopover = () => {
		setDeletePopoverOpen(true);
	};

	// Function to close the delete popover
	const closeDeletePopover = () => {
		setDeletePopoverOpen(false);
	};

	const handleDeleteGroup = () => {
		deleteGroupMutation.mutate({
			groupId: group.id,
		});
	};
	return (
		<PermissionsCard isSelected={isSelected} entity={group}>
			<Text fontSize="xl" fontWeight="bold">
				{group.name}
			</Text>
			<Popover
				returnFocusOnClose={false}
				isOpen={isDeletePopoverOpen}
				onClose={closeDeletePopover}
				placement="right"
				closeOnBlur={false}
			>
				<PopoverTrigger>
					<IconButton
						aria-label="Delete Group"
						size="xs"
						icon={<Trash size="12" />}
						bgColor="red"
						onClick={openDeletePopover}
					/>
				</PopoverTrigger>
				<PopoverContent>
					<PopoverArrow />
					<PopoverCloseButton />
					<PopoverHeader fontSize="md">Confirm Delete</PopoverHeader>
					<PopoverBody fontSize="md">
						Are you sure you want to delete this group?
					</PopoverBody>
					<PopoverFooter display="flex" justifyContent="flex-end">
						<ButtonGroup>
							<Button
								colorScheme="red"
								size="sm"
								onClick={handleDeleteGroup}
								isLoading={deleteGroupMutation.isLoading}
							>
								Delete
							</Button>
							<Button variant="ghost" size="sm" onClick={closeDeletePopover}>
								Cancel
							</Button>
						</ButtonGroup>
					</PopoverFooter>
				</PopoverContent>
			</Popover>
		</PermissionsCard>
	);
};
