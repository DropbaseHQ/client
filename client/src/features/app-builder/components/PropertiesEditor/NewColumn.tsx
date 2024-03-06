import {
	Box,
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
	Stack,
	useDisclosure,
} from '@chakra-ui/react';
import { useAtomValue } from 'jotai';

import { Plus } from 'react-feather';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { useStatus } from '@/layout/StatusBar';
import { useGetTable, useResourceFields } from '@/features/app-builder/hooks';
import { useToast } from '@/lib/chakra-ui';
import { FormInput } from '@/components/FormInput';
import { getErrorMessage } from '@/utils';

import { EventPropertyEditor } from '@/features/app-builder/components/PropertiesEditor/EventPropertyEditor';
import { useGetPage, useUpdatePageData } from '@/features/page';
import { selectedTableIdAtom } from '@/features/app-builder/atoms';

export const NewColumn = (props: any) => {
	const toast = useToast();
	const methods = useForm({
		shouldUnregister: true,
	});
	const { pageName, appName } = useParams();
	const tableName = useAtomValue(selectedTableIdAtom);

	const { isConnected } = useStatus();

	const { properties: pageProperties } = useGetPage({ appName, pageName });

	const { columns } = useGetTable(tableName || '');

	const { isOpen, onClose, onToggle } = useDisclosure({
		onClose: () => {
			methods.reset();
		},
	});

	const { fields: resourceFields } = useResourceFields();
	const btnColumnFields = resourceFields?.button_column;

	const mutation = useUpdatePageData({
		onSuccess: () => {
			toast({
				title: 'Created virtual column',
			});
			onClose();
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to create virtual column',
				description: getErrorMessage(error),
			});
		},
	});

	const onSubmit = (formValues: any) => {
		mutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: {
				...(pageProperties || {}),
				tables: (pageProperties?.tables || []).map((t: any) => {
					if (t.name === tableName) {
						return {
							...t,
							columns: [
								...(t?.columns || []),
								{ ...formValues, column_type: 'button_column' },
							],
						};
					}

					return t;
				}),
			},
		});
	};

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur={false}>
			<PopoverTrigger>
				<Button
					variant="ghost"
					size="sm"
					flexShrink="0"
					mr="auto"
					onClick={onToggle}
					isDisabled={!isConnected}
					isLoading={mutation.isLoading}
					{...props}
				>
					<Stack alignItems="center" justifyContent="center" direction="row">
						<Plus size="14" />
						<Box>Add Action Column</Box>
					</Stack>
				</Button>
			</PopoverTrigger>

			<Portal>
				<PopoverContent
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					<PopoverHeader pt={4} fontWeight="bold" fontSize="md" border="0">
						Create a new action column
					</PopoverHeader>
					<PopoverArrow />
					<PopoverCloseButton />
					<FormProvider {...methods}>
						<form onSubmit={methods.handleSubmit(onSubmit)}>
							<PopoverBody>
								{isOpen ? (
									<Stack spacing="2">
										<Stack>
											{btnColumnFields
												.filter(
													(p: any) =>
														p.name === 'label' || p.name === 'name',
												)
												.map((property: any) => {
													// FIXME: reuse this logic of iteration
													if (property?.name === 'label') {
														return (
															<FormInput
																{...property}
																id={property.name}
																name="Button Label"
																type="template"
																key={property.name}
															/>
														);
													}

													if (property?.name === 'name') {
														return (
															<FormInput
																{...property}
																id={property.name}
																name="Column Name"
																validation={{
																	required: 'Cannot  be empty',
																	validate: {
																		unique: (value: any) => {
																			if (
																				columns.find(
																					(c: any) =>
																						c.name ===
																						value,
																				)
																			) {
																				return 'Name must be unique';
																			}

																			return true;
																		},
																	},
																}}
															/>
														);
													}

													if (
														property.name === 'on_click' ||
														property.name === 'on_change'
													) {
														return (
															<EventPropertyEditor
																id={property.name}
															/>
														);
													}

													const showFunctionList =
														property.type === 'function';

													return (
														<FormInput
															{...property}
															id={property.name}
															name={property.title}
															type={
																showFunctionList
																	? 'select'
																	: property.type
															}
															options={(
																property.enum ||
																property.options ||
																[]
															).map((o: any) => ({
																name: o,
																value: o,
															}))}
															key={property.name}
														/>
													);
												})}
										</Stack>
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
