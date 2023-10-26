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

import { useSetAtom } from 'jotai';

import { Trash } from 'react-feather';
import { FormProvider, useForm } from 'react-hook-form';
import { useToast } from '@/lib/chakra-ui';
import { useDeleteTable } from '@/features/app-builder/hooks';
import { inspectedResourceAtom } from '@/features/app-builder/atoms';

export const DeleteTable = ({ tableId, tableName, ...props }: any) => {
	const toast = useToast();
	const methods = useForm();

	const setDevTab = useSetAtom(inspectedResourceAtom);

	const { isOpen, onToggle, onClose } = useDisclosure({
		onClose: () => {
			setDevTab({
				type: null,
				id: null,
			});
		},
	});

	const mutation = useDeleteTable({
		onSuccess: () => {
			onClose();
			toast({
				status: 'success',
				title: 'Table Deleted',
			});
		},
	});

	const onSubmit = () => {
		mutation.mutate({
			tableId,
		});
	};

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur={false}>
			<PopoverTrigger>
				<Button
					aria-label="Delete table"
					leftIcon={<Trash size="14" />}
					onClick={onToggle}
					isLoading={mutation.isLoading}
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
						Delete table
					</PopoverHeader>
					<PopoverArrow />
					<PopoverCloseButton />
					<FormProvider {...methods}>
						<form onSubmit={methods.handleSubmit(onSubmit)}>
							<PopoverBody>
								Are you sure you want to delete {tableName} table?
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
					</FormProvider>
				</PopoverContent>
			</Portal>
		</Popover>
	);
};
