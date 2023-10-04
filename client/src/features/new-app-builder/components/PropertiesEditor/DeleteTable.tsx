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
import { FormProvider, useForm } from 'react-hook-form';
import { useToast } from '@/lib/chakra-ui';
import { useDeleteTable } from '@/features/new-app-builder/hooks';
import { FormInput } from '@/components/FormInput';
import { developerTabAtom } from '@/features/new-app-builder/atoms';
import { useGetPage } from '@/features/new-page';

export const DeleteTable = ({ tableId, tableName, ...props }: any) => {
	const toast = useToast();
	const methods = useForm();
	const { pageId } = useParams();

	const setDevTab = useSetAtom(developerTabAtom);

	const { tables } = useGetPage(pageId);

	const nextTableSelection = tables.filter((t: any) => t.id !== tableId)?.[0]?.id || null;

	const { isOpen, onToggle, onClose } = useDisclosure({
		onClose: () => {
			methods.reset();
			if (nextTableSelection) {
				setDevTab({
					type: 'table',
					id: nextTableSelection,
				});
			} else {
				setDevTab({
					type: null,
					id: null,
				});
			}
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
								<FormInput
									name="Table name"
									id="name"
									placeholder={`Write ${tableName} to delete`}
									validation={{
										validate: (value: any) =>
											value === tableName || 'Table name didnt match',
									}}
								/>
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
