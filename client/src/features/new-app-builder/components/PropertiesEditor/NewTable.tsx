import { useParams } from 'react-router-dom';
import {
	Button,
	ButtonGroup,
	IconButton,
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
import { useAtomValue } from 'jotai';

import { Plus } from 'react-feather';
import { FormProvider, useForm } from 'react-hook-form';
import { useToast } from '@/lib/chakra-ui';
import { useCreateTable } from '@/features/new-app-builder/hooks';
import { FormInput } from '@/components/FormInput';
import { useSources } from '@/features/sources/hooks';
import { workspaceAtom } from '@/features/workspaces';

export const NewTable = (props: any) => {
	const workspaceId = useAtomValue(workspaceAtom);
	const { pageId } = useParams();

	const toast = useToast();
	const methods = useForm();
	const { isOpen, onToggle, onClose } = useDisclosure();

	const { sources } = useSources(workspaceId);

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

	const onSubmit = ({ name, sourceId }: any) => {
		mutation.mutate({
			pageId,
			property: { name },
			sourceId,
		});
	};

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur={false}>
			<PopoverTrigger>
				<IconButton
					aria-label="Add table"
					icon={<Plus size="14" />}
					onClick={onToggle}
					isLoading={mutation.isLoading}
					{...props}
				/>
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

								<FormInput
									type="select"
									id="sourceId"
									name="Source"
									placeholder="Select source "
									validation={{ required: 'Source is required' }}
									options={sources.map((s: any) => ({
										value: s.id,
										name: s.name,
									}))}
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
