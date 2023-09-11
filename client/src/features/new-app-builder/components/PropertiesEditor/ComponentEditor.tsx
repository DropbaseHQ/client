import { useEffect } from 'react';
import { Plus } from 'react-feather';
import { FormProvider, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import {
	FormLabel,
	FormControl,
	Stack,
	FormErrorMessage,
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
import { FormInput } from '@/components/FormInput';
import {
	useCreateComponents,
	useGetComponentProperties,
	useUpdateComponentProperties,
} from '@/features/new-app-builder/hooks';

const WIDGET_ID = '62a43f32-89f6-4143-a8e9-57cbdf0889b1';

const ComponentPropertyEditor = ({ id, type, property: properties }: any) => {
	const { schema, refetch } = useGetComponentProperties(WIDGET_ID);

	const methods = useForm();
	const {
		formState: { errors, isDirty },
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
							<FormControl isInvalid={!!errors?.[property.name]} key={property.name}>
								<FormLabel>{property.name}</FormLabel>

								<FormInput {...property} />
								<ErrorMessage
									errors={errors}
									name={property.name}
									render={({ message }) => (
										<FormErrorMessage>{message}</FormErrorMessage>
									)}
								/>
							</FormControl>
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
	const { isOpen, onToggle, onClose } = useDisclosure();

	const methods = useForm();
	const {
		formState: { errors },
	} = methods;

	const mutation = useCreateComponents({
		onSuccess: () => {
			methods.reset();
			onClose();
		},
	});

	const onSubmit = ({ name, type }: any) => {
		if (name.trim()) {
			mutation.mutate({
				widgetId: WIDGET_ID,
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
								<FormControl isInvalid={!!errors?.name}>
									<FormLabel>Name</FormLabel>

									<FormInput
										name="name"
										validation={{ required: 'Name is required' }}
										type="text"
									/>
									<ErrorMessage
										errors={errors}
										name="name"
										render={({ message }) => (
											<FormErrorMessage>{message}</FormErrorMessage>
										)}
									/>
								</FormControl>

								<FormControl isInvalid={!!errors?.type}>
									<FormLabel>Type</FormLabel>

									<FormInput
										name="type"
										type="select"
										enum={['select', 'text', 'number']}
									/>
									<ErrorMessage
										errors={errors}
										name="type"
										render={({ message }) => (
											<FormErrorMessage>{message}</FormErrorMessage>
										)}
									/>
								</FormControl>
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
	const { isLoading, values } = useGetComponentProperties(WIDGET_ID);

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
