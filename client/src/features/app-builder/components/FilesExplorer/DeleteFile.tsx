import {
	Button,
	ButtonGroup,
	Icon,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverFooter,
	PopoverHeader,
	PopoverTrigger,
	Portal,
	useDisclosure,
} from '@chakra-ui/react';

import { useAtomValue, useSetAtom } from 'jotai';

import { Trash } from 'react-feather';

import { useToast } from '@/lib/chakra-ui';
import { developerTabAtom } from '@/features/app-builder/atoms';
import { useDeleteFile } from '@/features/app-builder/hooks';
import { pageAtom } from '@/features/page';
import { getErrorMessage } from '@/utils';

export const DeleteFile = ({ name, id, type, ...props }: any) => {
	const toast = useToast();
	const { appName, pageName } = useAtomValue(pageAtom);

	const setDevTab = useSetAtom(developerTabAtom);

	const { isOpen, onToggle, onClose } = useDisclosure({
		onClose: () => {
			setDevTab({
				type: null,
				id: null,
			});
		},
	});

	const mutation = useDeleteFile({
		onSuccess: () => {
			onClose();
			toast({
				status: 'success',
				title: 'Function Deleted',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to delete function',
				description: getErrorMessage(error),
			});
		},
	});

	const onSubmit = (e: any) => {
		e?.preventDefault();
		mutation.mutate({
			pageName,
			appName,
			fileName: name,
			fileType: type,
		});
	};

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur={false}>
			<PopoverTrigger>
				<Icon
					aria-label="Delete function"
					as={Trash}
					onClick={(e) => {
						e.stopPropagation();
						onToggle();
					}}
					isLoading={mutation.isLoading}
					boxSize={5}
					p={1}
					color="red.400"
					borderRadius="sm"
					_hover={{
						bg: 'red.100',
					}}
					{...props}
				/>
			</PopoverTrigger>

			<Portal>
				<PopoverContent>
					<PopoverHeader pt={4} fontWeight="bold" fontSize="md" border="0">
						Delete Function
					</PopoverHeader>
					<PopoverArrow />
					<PopoverCloseButton />
					<form onSubmit={onSubmit}>
						<PopoverBody fontSize="md">
							Are you sure you want to delete {name}?
						</PopoverBody>
						<PopoverFooter
							border="0"
							display="flex"
							justifyContent="space-between"
							pb={4}
						>
							<ButtonGroup ml="auto" size="sm">
								<Button onClick={onClose} colorScheme="gray" variant="ghost">
									Cancel
								</Button>
								<Button
									colorScheme="red"
									type="submit"
									isLoading={mutation.isLoading}
								>
									Delete
								</Button>
							</ButtonGroup>
						</PopoverFooter>
					</form>
				</PopoverContent>
			</Portal>
		</Popover>
	);
};
