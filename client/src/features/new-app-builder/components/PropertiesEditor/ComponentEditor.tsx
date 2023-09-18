import { useEffect } from 'react';
import { Plus } from 'react-feather';
import { FormProvider, useForm } from 'react-hook-form';
import {
	Stack,
	Box,
	Skeleton,
	Button,
	Popover,
	PopoverTrigger,
	IconButton,
	PopoverContent,
	PopoverHeader,
	PopoverArrow,
	PopoverCloseButton,
	PopoverBody,
	PopoverFooter,
	ButtonGroup,
	useDisclosure,
} from '@chakra-ui/react';
import { useAtomValue } from 'jotai';

import { FormInput } from '@/components/FormInput';
import {
	useCreateComponents,
	useGetComponentProperties,
	useUpdateComponentProperties,
} from '@/features/new-app-builder/hooks';
import { pageAtom } from '@/features/new-page';

const ComponentPropertyEditor = ({ id, type, property: properties }: any) => {
	const { widgetId } = useAtomValue(pageAtom);
	const { schema, refetch } = useGetComponentProperties(widgetId || '');

	const methods = useForm();
	const {
		formState: { isDirty },
		reset,
	} = methods;

	const mutation = useUpdateComponentProperties({
		onSuccess: () => {
			refetch();
		},
	});

	useEffect(() => {
		reset(properties, {
			keepDirty: false,
			keepDirtyValues: false,
		});
	}, [properties, reset]);

	const onSubmit = (formValues: any) => {
		mutation.mutate({
			componentId: id,
			payload: formValues,
			type,
		});
	};

	return (
		<Box minW="sm" borderWidth="1px" p="3.5" maxW="md" borderRadius="md" bg="white">
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				<FormProvider {...methods}>
					<Stack>
						{schema.map((property: any) => (
							<FormInput {...property} id={property.name} key={property.name} />
						))}

						{isDirty ? (
							<Stack direction="row">
								<Button isLoading={mutation.isLoading} type="submit">
									Save
								</Button>
							</Stack>
						) : null}
					</Stack>
				</FormProvider>
			</form>
		</Box>
	);
};

export const NewComponent = () => {
	const { widgetId } = useAtomValue(pageAtom);
	const { isOpen, onToggle, onClose } = useDisclosure();

	const methods = useForm();

	const mutation = useCreateComponents({
		onSuccess: () => {
			methods.reset();
			onClose();
		},
	});

	const onSubmit = ({ name, type }: any) => {
		if (name.trim()) {
			mutation.mutate({
				widgetId,
				property: { name, type },
				type: 'input',
			});
		}
	};

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur={false}>
			<PopoverTrigger>
				<IconButton
					aria-label="Add function"
					icon={<Plus size="14" />}
					variant="outline"
					onClick={onToggle}
					isLoading={mutation.isLoading}
				/>
			</PopoverTrigger>

			<PopoverContent>
				<form onSubmit={methods.handleSubmit(onSubmit)}>
					<FormProvider {...methods}>
						<PopoverHeader pt={4} fontWeight="bold" border="0">
							Create a new Component
						</PopoverHeader>
						<PopoverArrow />
						<PopoverCloseButton />
						<PopoverBody>
							<Stack>
								<FormInput
									name="Name"
									id="name"
									validation={{ required: 'Name is required' }}
									type="text"
								/>

								<FormInput
									name="Type"
									id="type"
									type="select"
									enum={['select', 'text', 'number']}
								/>
							</Stack>
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
									isLoading={mutation.isLoading}
									type="submit"
								>
									Create
								</Button>
							</ButtonGroup>
						</PopoverFooter>
					</FormProvider>
				</form>
			</PopoverContent>
		</Popover>
	);
};

export const Components = () => {
	const { widgetId } = useAtomValue(pageAtom);
	const { isLoading, values } = useGetComponentProperties(widgetId || '');

	if (isLoading) {
		return <Skeleton />;
	}

	return (
		<Stack h="full">
			<NewComponent />
			<Stack direction="row" spacing="4" overflowX="auto" flexWrap="nowrap">
				{values.map((value: any) => (
					<ComponentPropertyEditor key={value.id} {...value} />
				))}
			</Stack>
		</Stack>
	);
};
