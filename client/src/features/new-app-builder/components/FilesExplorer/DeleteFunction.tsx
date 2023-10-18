import {
	Button,
	ButtonGroup,
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

import { useParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';

import { Trash } from 'react-feather';
// import { useToast } from '@/lib/chakra-ui';
// import { useDeleteFunction } from '@/features/new-app-builder/hooks';
import { developerTabAtom } from '@/features/new-app-builder/atoms';
import { useGetPage } from '@/features/new-page';

export const DeleteFunction = ({ functionId, functionName, ...props }: any) => {
	// const toast = useToast();
	const { pageId } = useParams();

	const setDevTab = useSetAtom(developerTabAtom);

	const { functions } = useGetPage(pageId);

	const nextFunctionSelection =
		functions.filter((t: any) => t.id !== functionId)?.[0]?.id || null;

	const { isOpen, onToggle, onClose } = useDisclosure({
		onClose: () => {
			if (nextFunctionSelection) {
				setDevTab({
					type: 'function',
					id: nextFunctionSelection,
				});
			} else {
				setDevTab({
					type: null,
					id: null,
				});
			}
		},
	});

	// const mutation = useDeleteFunction({
	// 	onSuccess: () => {
	// 		onClose();
	// 		toast({
	// 			status: 'success',
	// 			title: 'Function Deleted',
	// 		});
	// 	},
	// });

	const onSubmit = (e: any) => {
		e?.preventDefault();
		// mutation.mutate({
		// 	functionId,
		// });
	};

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur={false}>
			<PopoverTrigger>
				<Button
					aria-label="Delete function"
					leftIcon={<Trash size="14" />}
					onClick={onToggle}
					// isLoading={mutation.isLoading}
					colorScheme="red"
					size="sm"
					variant="outline"
					{...props}
				>
					Delete
				</Button>
			</PopoverTrigger>

			<Portal>
				<PopoverContent>
					<PopoverHeader pt={4} fontWeight="bold" border="0">
						Delete Function
					</PopoverHeader>
					<PopoverArrow />
					<PopoverCloseButton />
					<form onSubmit={onSubmit}>
						<PopoverBody>
							Are you sure you want to delete {functionName} function?
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
									// isLoading={mutation.isLoading}
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
