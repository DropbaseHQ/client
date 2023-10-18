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
import { Plus } from 'react-feather';
import { FormProvider, useForm } from 'react-hook-form';

import { useCreateFile, usePageFiles } from '@/features/new-app-builder/hooks';
import { useToast } from '@/lib/chakra-ui';
import { FormInput } from '@/components/FormInput';

export const NewFile = (props: any) => {
	const toast = useToast();
	const methods = useForm();

	const { refetch } = usePageFiles({
		appName: 'app',
		pageName: 'page1',
	});

	const { isOpen, onToggle, onClose } = useDisclosure();

	const mutation = useCreateFile({
		onSuccess: () => {
			toast({
				title: 'File created successfully',
			});
			refetch();
			methods.reset();
			onClose();
		},
	});

	const onSubmit = ({ type, name }: any) => {
		mutation.mutate({
			pageName: 'page1',
			appName: 'app',
			fileName: `${name}.${type === 'python' ? 'py' : 'sql'}`,
		});
	};

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur={false}>
			<PopoverTrigger>
				<IconButton
					aria-label="Add function"
					icon={<Plus size="14" />}
					onClick={onToggle}
					isLoading={mutation.isLoading}
					{...props}
				/>
			</PopoverTrigger>

			<Portal>
				<PopoverContent>
					<PopoverHeader pt={4} fontWeight="bold" border="0">
						Create a new file
					</PopoverHeader>
					<PopoverArrow />
					<PopoverCloseButton />
					<FormProvider {...methods}>
						<form onSubmit={methods.handleSubmit(onSubmit)}>
							<PopoverBody>
								<FormInput
									type="text"
									validation={{ required: 'Cannot  be empty' }}
									name="name"
									id="name"
								/>
								<FormInput
									type="select"
									options={[
										{
											name: 'SQL',
											value: 'sql',
										},
										{
											name: 'Python',
											value: 'python',
										},
									]}
									validation={{ required: 'Cannot  be empty' }}
									name="type"
									id="type"
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
