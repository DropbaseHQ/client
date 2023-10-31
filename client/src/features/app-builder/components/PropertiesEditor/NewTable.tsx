import { useParams } from 'react-router-dom';
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
import { useEffect } from 'react';

import { Plus } from 'react-feather';
import { FormProvider, useForm } from 'react-hook-form';
import { useToast } from '@/lib/chakra-ui';
import { useCreateTable } from '@/features/app-builder/hooks';
import { FormInput } from '@/components/FormInput';
import { useGetPage } from '@/features/page';
import { generateSequentialName } from '@/utils';

export const NewTable = (props: any) => {
	const { pageId } = useParams();

	const { tables } = useGetPage(pageId);
	const toast = useToast();
	const methods = useForm();
	const { isOpen, onToggle, onClose } = useDisclosure();

	const nextName = generateSequentialName({
		currentNames: tables.map((t: any) => t.name) || [],
		prefix: 'table',
	});

	const mutation = useCreateTable({
		onSuccess: () => {
			methods.reset();
			onClose();
			toast({
				status: 'success',
				title: 'Table created',
			});
		},
	});

	const currentLastTable = tables[tables.length - 1];
	const onSubmit = ({ name }: any) => {
		mutation.mutate({
			name,
			pageId,
			property: { appears_after: currentLastTable?.name },
		});
	};

	useEffect(() => {
		methods.setValue('name', nextName);
	}, [methods, nextName]);

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur={false}>
			<PopoverTrigger>
				<Button
					aria-label="Add table"
					leftIcon={<Plus size="14" />}
					onClick={onToggle}
					isLoading={mutation.isLoading}
					{...props}
				>
					New Table
				</Button>
			</PopoverTrigger>

			<Portal>
				<PopoverContent>
					<PopoverHeader pt={4} fontWeight="bold" border="0">
						Create a new table
					</PopoverHeader>
					<PopoverArrow />
					<PopoverCloseButton />
					<FormProvider {...methods}>
						<form onSubmit={methods.handleSubmit(onSubmit)}>
							<PopoverBody>
								<FormInput
									type="text"
									id="name"
									name="Table name"
									placeholder="Enter table name"
									validation={{ required: 'Table name is required' }}
								/>
							</PopoverBody>
							<PopoverFooter
								border="0"
								display="flex"
								alignItems="center"
								justifyContent="space-between"
								pb={4}
							>
								<ButtonGroup size="sm">
									<Button onClick={onClose} colorScheme="red" variant="outline">
										Cancel
									</Button>
									<Button
										colorScheme="blue"
										type="submit"
										isLoading={mutation.isLoading}
									>
										Create
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
