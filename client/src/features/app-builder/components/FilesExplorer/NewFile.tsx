import {
	Badge,
	Box,
	Button,
	ButtonGroup,
	FormControl,
	FormLabel,
	Icon,
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
	Stack,
	Text,
	useDisclosure,
} from '@chakra-ui/react';
import { Plus, Table, Code } from 'react-feather';
import { FormProvider, useForm } from 'react-hook-form';
import { useSetAtom } from 'jotai';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

import { useStatus } from '@/layout/StatusBar';
import { useCreateFile, usePageFiles } from '@/features/app-builder/hooks';
import { useToast } from '@/lib/chakra-ui';
import { FormInput } from '@/components/FormInput';
import { useGetPage } from '@/features/page';
import { generateSequentialName, getErrorMessage } from '@/utils';
import { developerTabAtom } from '../../atoms';

const fileOptions = [
	{
		name: 'SQL Data Fetcher',
		value: 'sql',
		icon: Table,
		description: 'Fetch data to tables via SQL',
		extension: 'sql',
	},
	{
		name: 'Python',
		value: 'python',
		icon: Code,
		description: 'Python scripts',
		extension: 'py',
	},
];

export const NewFile = ({ children, ...props }: any) => {
	const toast = useToast();
	const methods = useForm<any>({
		shouldUnregister: true,
		defaultValues: {
			type: 'python',
		},
	});

	const { appName, pageName } = useParams();
	const { isConnected } = useStatus();
	const { files } = useGetPage({ appName, pageName });

	const setDevTab = useSetAtom(developerTabAtom);

	const { refetch } = usePageFiles({
		pageName: pageName || '',
		appName: appName || '',
	});

	const { isOpen, onToggle, onClose } = useDisclosure({
		onClose: () => {
			methods.reset();
			methods.setValue('type', null);
		},
	});

	const mutation = useCreateFile({
		onSuccess: (_: any, variables: any) => {
			setDevTab({
				type: variables?.type === 'sql' ? 'sql' : 'function',
				id: variables?.fileName,
			});

			toast({
				title: 'File created successfully',
			});
			refetch();
			onClose();
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to create file',
				description: getErrorMessage(error),
			});
		},
	});

	const currentType = methods.watch('type');
	const currentName = methods.watch('name');

	const onSubmit = ({ type, name }: any) => {
		mutation.mutate({
			pageName,
			appName,
			fileName: name,
			type,
		});
	};

	useEffect(() => {
		methods.setValue(
			'name',
			generateSequentialName({
				currentNames: files.map((f: any) => f.name),
				prefix: 'function',
			})?.name,
		);
	}, [methods, isOpen, files]);

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur={false}>
			<PopoverTrigger>
				{children ? (
					children?.({
						onClick: (e: any) => {
							e.stopPropagation();
							onToggle();
						},
						isDisabled: !isConnected,
						isLoading: mutation.isLoading,
					})
				) : (
					<IconButton
						aria-label="Add function"
						data-cy="create-file-button"
						icon={<Plus size="14" />}
						onClick={(e) => {
							e.stopPropagation();
							onToggle();
						}}
						isDisabled={!isConnected}
						isLoading={mutation.isLoading}
						{...props}
					/>
				)}
			</PopoverTrigger>

			<Portal>
				<PopoverContent
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					<PopoverHeader pt={4} fontWeight="bold" fontSize="md" border="0">
						Create a new function
					</PopoverHeader>
					<PopoverArrow />
					<PopoverCloseButton />
					<FormProvider {...methods}>
						<form onSubmit={methods.handleSubmit(onSubmit)}>
							<PopoverBody>
								{isOpen ? (
									<Stack spacing="2">
										<FormInput
											type="text"
											validation={{
												required: 'Cannot  be empty',
												validate: {
													unique: (value: any) => {
														if (
															files.find((f: any) => f.name === value)
														) {
															return 'Name must be unique';
														}

														return true;
													},
												},
											}}
											name="name"
											id="name"
										/>
										<FormInput
											type="custom-select"
											options={fileOptions.map((option: any) => ({
												...option,
												icon: null,
												render: (isSelected: boolean) => {
													return (
														<Stack alignItems="center" direction="row">
															<Icon
																boxSize="6"
																as={option.icon}
																flexShrink="0"
																color={isSelected ? 'blue.500' : ''}
															/>
															<Stack spacing="0">
																<Text
																	fontWeight="medium"
																	fontSize="sm"
																>
																	{option.name}
																</Text>
																<Text
																	color="gray.600"
																	fontSize="xs"
																>
																	{option.description}
																</Text>
															</Stack>
															<Badge
																textTransform="lowercase"
																size="xs"
																ml="auto"
																colorScheme={
																	isSelected ? 'blue' : 'gray'
																}
															>
																.{option.extension}
															</Badge>
														</Stack>
													);
												},
											}))}
											validation={{ required: 'Cannot  be empty' }}
											name="type"
											id="type"
											data-cy="file-type"
										/>

										<FormControl>
											<FormLabel>Autogenerated file</FormLabel>
											<Box
												fontFamily="monospace"
												fontStyle="italic"
												p="1"
												w="fit-content"
												bg="gray.50"
												fontSize="sm"
												lineHeight={1}
											>
												{currentName}
												{currentType === 'sql' ? '.sql' : '.py'}
											</Box>
										</FormControl>
									</Stack>
								) : null}
							</PopoverBody>
							<PopoverFooter
								border="0"
								display="flex"
								alignItems="center"
								justifyContent="space-between"
								pb={4}
							>
								<ButtonGroup size="sm">
									<Button
										onClick={onClose}
										colorScheme="red"
										variant="outline"
										data-cy="cancel-create-file"
									>
										Cancel
									</Button>
									<Button
										colorScheme="blue"
										type="submit"
										isLoading={mutation.isLoading}
										data-cy="confirm-create-file"
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
