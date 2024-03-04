import { useState } from 'react';
import { Trash } from 'react-feather';
import {
	Button,
	IconButton,
	Box,
	Text,
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

import { GET_WORKSPACE_GROUPS_QUERY_KEY } from './hooks/workspace';

import { useDeleteGroup } from './hooks/group';

export const GroupCard = ({
	selectedGroup,
	setSelectedGroup,
	group,
}: {
	selectedGroup: string;
	setSelectedGroup: any;
	group: any;
}) => {
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

	const closeDeletePopover = () => {
		setDeletePopoverOpen(false);
	};

	const handleDeleteGroup = () => {
		deleteGroupMutation.mutate({
			groupId: group.id,
		});
	};
	return (
		<Box
			key={group.id}
			px="2"
			py="1"
			// boxShadow={selectedGroup === group.id ? 'sm' : 'md'}
			bgColor={selectedGroup === group.id ? 'gray.100' : ''}
			_hover={{ cursor: 'pointer', bg: 'gray.100' }}
			borderColor={selectedGroup === group.id ? 'blue.500' : 'gray.200'}
			onClick={() => setSelectedGroup(group.id)}
			display="flex"
			alignItems="center"
			w="full"
			justifyContent="space-between"
		>
			<Text fontSize="lg">{group.name}</Text>
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
						icon={<Trash size="14" />}
						variant="ghost"
						color="red"
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
		</Box>
	);
};
