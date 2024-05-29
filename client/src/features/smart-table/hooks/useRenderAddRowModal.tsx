import {
	Button,
	FormControl,
	FormLabel,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Stack,
	useDisclosure,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { InputRenderer } from '@/components/FormInput';
import { pageStateAtom } from '@/features/app-state';
import { useAddRow } from '@/features/smart-table/hooks/table';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';

export const useRenderAddRowModal = ({ columns, table }: any) => {
	const toast = useToast();
	const { isOpen, onClose, onOpen } = useDisclosure();
	const pageState = useAtomValue(pageStateAtom);

	const { appName, pageName } = useParams();

	const [row, setRow] = useState<any>({});

	const addRowMutation = useAddRow({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Cell edits saved',
			});
			setRow({});
			onClose();
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to save edits',
				description: getErrorMessage(error),
			});
		},
	});

	const createNewRow = () => {
		addRowMutation.mutate({
			appName,
			pageName,
			resource: table,
			state: pageState,
			row,
		});
	};

	const renderAddRowModal = () => {
		return (
			<Modal size="xl" isCentered isOpen={isOpen} onClose={onClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader borderBottomWidth="1px">Add Row</ModalHeader>
					<ModalCloseButton />
					<ModalBody py="6" px="6">
						<Stack spacing="4">
							{columns
								.filter((c: any) => c.column_type !== 'button_column')
								.map((c: any) => {
									let inputComponent = null;

									switch (c.display_type) {
										case 'array': {
											inputComponent = (
												<InputRenderer
													value={(row?.[c.name] || [])?.map((a: any) => ({
														key: a,
													}))}
													name={c.name}
													size="sm"
													type="array"
													keys={['a']}
													onChange={(newValue: any) => {
														setRow((oldValue: any) => ({
															...oldValue,
															[c.name]: newValue?.map(
																(a: any) => a.key,
															),
														}));
													}}
													options={c?.configurations?.options || []}
												/>
											);
											break;
										}
										default: {
											const nonNullConfigurationKey = Object.keys(
												c?.configurations || {},
											).find((key) => c?.configurations[key] !== null);

											if (nonNullConfigurationKey) {
												const configurations =
													c?.configurations?.[nonNullConfigurationKey];

												switch (nonNullConfigurationKey) {
													case 'select': {
														inputComponent = (
															<InputRenderer
																value={row?.[c.name]}
																name={c.name}
																size="sm"
																type={
																	configurations?.multiple
																		? 'multiselect'
																		: 'select'
																}
																onChange={(newValue: any) => {
																	setRow((oldValue: any) => ({
																		...oldValue,
																		[c.name]: newValue,
																	}));
																}}
																options={
																	configurations?.options || []
																}
															/>
														);
														break;
													}
													default: {
														inputComponent = null;
													}
												}
											}
											if (!inputComponent) {
												inputComponent = (
													<InputRenderer
														value={row?.[c.name]}
														name={c.name}
														size="sm"
														type={c.display_type}
														onChange={(newValue: any) => {
															setRow((oldValue: any) => ({
																...oldValue,
																[c.name]: newValue,
															}));
														}}
													/>
												);
											}

											break;
										}
									}
									return (
										<FormControl key={c.name}>
											<FormLabel lineHeight={1}>{c?.name}</FormLabel>
											{inputComponent}
										</FormControl>
									);
								})}
						</Stack>
					</ModalBody>

					<ModalFooter borderTopWidth="1px">
						<Button
							variant="outline"
							colorScheme="gray"
							size="sm"
							mr={3}
							isDisabled={addRowMutation.isLoading}
							onClick={onClose}
						>
							Close
						</Button>
						<Button
							onClick={createNewRow}
							isLoading={addRowMutation.isLoading}
							size="sm"
							colorScheme="blue"
						>
							Add Row
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		);
	};

	return {
		onOpen,
		renderAddRowModal,
	};
};
