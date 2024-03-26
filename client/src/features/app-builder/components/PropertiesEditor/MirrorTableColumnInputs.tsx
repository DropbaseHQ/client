import {
	Button,
	ButtonGroup,
	FormControl,
	FormLabel,
	Popover,
	PopoverBody,
	PopoverContent,
	PopoverFooter,
	PopoverHeader,
	PopoverTrigger,
	Stack,
	useDisclosure,
} from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { Copy } from 'react-feather';

import { useState } from 'react';
import { DashedBorder } from '@/components/DashedBorder';
import { pageAtom, useGetPage, useUpdatePageData } from '@/features/page';
import { getErrorMessage } from '@/utils';
import { InputRenderer } from '@/components/FormInput';
import { useToast } from '@/lib/chakra-ui';

export const MirrorTableColumns = ({ widgetName, ...props }: any) => {
	const toast = useToast();

	const { isOpen, onToggle, onClose } = useDisclosure({});

	const [selectedTable, setTable] = useState(null);
	const [hasDefault, setDefault] = useState(false);

	const { appName, pageName } = useAtomValue(pageAtom);
	const { properties, tables } = useGetPage({ appName, pageName });

	const mutation = useUpdatePageData({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Component added',
			});
			onClose();
			setTable(null);
			setDefault(false);
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to create component',
				description: getErrorMessage(error),
			});
		},
	});

	const onSubmit = async () => {
		try {
			const table = tables.find((t: any) => t.name === selectedTable);

			const columnComponents = table?.columns?.map((c: any) => {
				let dataType = c.display_type;

				const component = {
					label: c.name,
					name: c.name,
					data_type: 'integer',
					placeholder: null,
					default: hasDefault ? `{{state.tables.${table.name}.${c.name}}}` : null,
					multiline: false,
					display_rules: null,
					component_type: 'input',
				};

				switch (c.display_type) {
					case 'currency': {
						dataType = 'float';
						break;
					}

					case 'boolean': {
						return {
							...component,
							data_type: 'boolean',
							component_type: 'boolean',
						};
					}

					case 'select': {
						return {
							...component,
							data_type: 'string',
							use_fetcher: false,
							options: c?.configurations?.options || [],
							multiple: c?.configurations?.multiple,
							fetcher: '',
							name_column: '',
							value_column: '',
							on_change: null,
							display_rules: null,
							component_type: 'select',
						};
					}
					default:
				}

				return {
					...component,
					data_type: dataType,
				};
			});

			await mutation.mutateAsync({
				app_name: appName,
				page_name: pageName,
				properties: {
					...(properties || {}),
					widgets: [
						...(properties?.widgets || []).map((w: any) => {
							if (w.name === widgetName) {
								return {
									...w,
									components: [...(w.components || []), ...columnComponents],
								};
							}

							return w;
						}),
					],
				},
			});
		} catch (e) {
			//
		}
	};

	return (
		<DashedBorder>
			<Popover isOpen={isOpen} onClose={onClose}>
				<PopoverTrigger>
					<Button
						onClick={onToggle}
						colorScheme="gray"
						w="full"
						variant="secondary"
						size="sm"
						isLoading={mutation.isLoading}
						leftIcon={<Copy size="14" />}
						{...props}
					>
						Mirror Components from Table Row
					</Button>
				</PopoverTrigger>
				<PopoverContent zIndex="popover">
					<PopoverHeader pt={4} fontWeight="bold" fontSize="md" border="0">
						Mirror components for table
					</PopoverHeader>
					<PopoverBody>
						<Stack>
							<FormControl>
								<FormLabel>Select Table</FormLabel>
								<InputRenderer
									type="select"
									options={tables.map((t: any) => ({
										name: t.label,
										value: t.name,
									}))}
									validation={{ required: 'Cannot  be empty' }}
									name="Select Table"
									id="table"
									onChange={setTable}
									value={selectedTable}
								/>
							</FormControl>

							<FormControl>
								<FormLabel>Use default value</FormLabel>
								<InputRenderer
									type="boolean"
									name="Use default value"
									id="hasDefault"
									value={hasDefault}
									onChange={setDefault}
								/>
							</FormControl>
						</Stack>
					</PopoverBody>
					<PopoverFooter display="flex">
						<ButtonGroup ml="auto" size="sm">
							<Button onClick={onClose} colorScheme="red" variant="outline">
								Cancel
							</Button>
							<Button
								onClick={onSubmit}
								isDisabled={!selectedTable}
								colorScheme="blue"
								type="submit"
								isLoading={mutation.isLoading}
							>
								Create
							</Button>
						</ButtonGroup>
					</PopoverFooter>
				</PopoverContent>
			</Popover>
		</DashedBorder>
	);
};
