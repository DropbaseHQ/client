import {
	Button,
	ButtonGroup,
	Popover,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverFooter,
	PopoverHeader,
	PopoverTrigger,
	useDisclosure,
	useToast,
} from '@chakra-ui/react';
import { Trash } from 'react-feather';
import { useParams } from 'react-router-dom';
import { useCurrentTableName } from '@/features/smart-table/hooks';
import { useEvent } from '@/features/app-preview/hooks';
import { useGetPage } from '@/features/page';
import { ACTIONS } from '@/constant';

export const DeleteRowButton = ({ row }: any) => {
	const { appName, pageName } = useParams();
	const toast = useToast();
	const { isOpen, onClose, onToggle } = useDisclosure();
	const tableName = useCurrentTableName();

	const { availableMethods } = useGetPage({ appName, pageName });

	const isDeleteRowMethodPresent = availableMethods?.[tableName]?.methods?.[ACTIONS.DELETE_ROW];

	const { handleEvent, mutation } = useEvent({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Row deleted',
			});
			onClose();
		},
	});

	const handleDelete = () => {
		handleEvent({
			action: ACTIONS.DELETE_ROW,
			resource: tableName,
			section: 'table',
		});
	};

	if (typeof row === 'number' && isDeleteRowMethodPresent) {
		return (
			<Popover
				returnFocusOnClose={false}
				isOpen={isOpen}
				onClose={onClose}
				placement="right"
				closeOnBlur={false}
			>
				<PopoverTrigger>
					<Button
						isLoading={mutation.isLoading}
						leftIcon={<Trash size="14" />}
						size="sm"
						variant="outline"
						colorScheme="red"
						onClick={onToggle}
					>
						Delete Row
					</Button>
				</PopoverTrigger>
				<PopoverContent>
					<PopoverHeader>Confirm Deleting Row</PopoverHeader>
					<PopoverCloseButton />
					<PopoverBody>Are you sure you want to continue with your action?</PopoverBody>
					<PopoverFooter display="flex" justifyContent="flex-end">
						<ButtonGroup size="sm">
							<Button colorScheme="gray" onClick={onClose} variant="outline">
								Cancel
							</Button>
							<Button onClick={handleDelete} colorScheme="red">
								Delete
							</Button>
						</ButtonGroup>
					</PopoverFooter>
				</PopoverContent>
			</Popover>
		);
	}

	return null;
};
