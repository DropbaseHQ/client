import { useState } from 'react';
import { Trash } from 'react-feather';
import {
	Button,
	IconButton,
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
	Stack,
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

	const isActive = selectedGroup === group.id;

	return (
		<Stack
			key={group.id}
			onClick={() => setSelectedGroup(group.id)}
			direction="row"
			alignItems="center"
			px="2"
			py="1"
			borderWidth={isActive ? '1px' : '0'}
			justifyContent="space-between"
			as="button"
			bg={isActive ? 'gray.50' : 'white'}
			borderRadius="sm"
			_hover={{
				bg: 'gray.50',
				color: 'gray.800',
			}}
			color={isActive ? 'gray.900' : 'gray.700'}
		>
			<Text fontSize="md">{group.name}</Text>
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
						colorScheme="red"
						onClick={openDeletePopover}
					/>
				</PopoverTrigger>
				<PopoverContent textAlign="left">
					<PopoverArrow />
					<PopoverCloseButton />
					<PopoverHeader fontSize="md">Confirm Delete</PopoverHeader>
					<PopoverBody fontSize="md">
						Are you sure you want to delete this group?
					</PopoverBody>
					<PopoverFooter display="flex" justifyContent="flex-end">
						<ButtonGroup>
							<Button variant="secondary" size="sm" onClick={closeDeletePopover}>
								Cancel
							</Button>
							<Button
								colorScheme="red"
								size="sm"
								onClick={handleDeleteGroup}
								isLoading={deleteGroupMutation.isLoading}
							>
								Delete
							</Button>
						</ButtonGroup>
					</PopoverFooter>
				</PopoverContent>
			</Popover>
		</Stack>
	);
};
