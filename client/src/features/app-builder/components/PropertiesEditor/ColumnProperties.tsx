import { MoreVertical, Zap } from 'react-feather';
import { Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import {
	Stack,
	Box,
	Skeleton,
	Text,
	Tooltip,
	FormLabel,
	Button,
	Divider,
	SimpleGrid,
	PopoverTrigger,
	Popover,
	PopoverContent,
	PopoverBody,
	PopoverHeader,
	Code,
} from '@chakra-ui/react';
import { InputRenderer } from '@/components/FormInput';
import { useConvertSmartTable, useGetTable, useResourceFields } from '@/features/app-builder/hooks';
import { useToast } from '@/lib/chakra-ui';
import { selectedTableIdAtom } from '@/features/app-builder/atoms';
import { newPageStateAtom } from '@/features/app-state';
import { getErrorMessage } from '@/utils';
import { useGetPage, useUpdatePageData } from '@/features/page';

const DISPLAY_COLUMN_PROPERTIES = [
	'schema_name',
	'table_name',
	'primary_key',
	'foreign_key',
	'nullable',
	'unique',
];

const ColumnProperty = ({ tableType, edit_keys, ...properties }: any) => {
	const toast = useToast();
	const tableName = useAtomValue(selectedTableIdAtom);
	const { appName, pageName } = useParams();

	const { properties: pageProperties } = useGetPage({ appName, pageName });

	const { fields } = useResourceFields();
	const columnFields = fields[tableType === 'sql' ? 'pgcolumn' : 'pycolumn'] || [];

	const updateMutation = useUpdatePageData({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Updated column properties',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to update properties',
				description: getErrorMessage(error),
			});
		},
	});

	const handleUpdate = (partialValues: any) => {
		updateMutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: {
				...(pageProperties || {}),
				tables: (pageProperties?.tables || []).map((t: any) => {
					if (t.name === tableName) {
						return {
							...t,
							columns: (t?.columns || []).map((c: any) => {
								if (c.name === properties.name) {
									return {
										...c,
										...properties,
										...partialValues,
									};
								}

								return c;
							}),
						};
					}

					return t;
				}),
			},
		});
	};

	const hasNoEditKeys = edit_keys?.length === 0;

	const allVisibleProperties = columnFields.filter((property: any) =>
		DISPLAY_COLUMN_PROPERTIES.includes(property.name),
	);

	return (
		<SimpleGrid alignItems="center" gap={3} columns={3}>
			<Box alignSelf="center" overflow="hidden">
				<Tooltip placement="left-end" label={properties.name}>
					<Code
						h="full"
						bg="transparent"
						fontSize="sm"
						whiteSpace="nowrap"
						display="inline"
						w="full"
						overflow="hidden"
						lineHeight={1}
						textOverflow="ellipsis"
						size="sm"
					>
						{properties.name}
					</Code>
				</Tooltip>
			</Box>
			<Tooltip label={hasNoEditKeys ? 'Not editable' : ''}>
				<Box>
					<InputRenderer
						type="boolean"
						isDisabled={
							tableType !== 'sql' || hasNoEditKeys || updateMutation.isLoading
						}
						id="editable"
						value={properties.editable}
						onChange={(newValue: any) => {
							handleUpdate({
								editable: newValue,
							});
						}}
					/>
				</Box>
			</Tooltip>
			<Stack alignItems="center" justifyContent="space-between" direction="row">
				<InputRenderer
					type="boolean"
					id="hidden"
					isDisabled={updateMutation.isLoading}
					value={properties.hidden}
					onChange={(newValue: any) => {
						handleUpdate({
							hidden: newValue,
						});
					}}
				/>
				<Popover placement="bottom-end">
					<PopoverTrigger>
						<Box
							as="button"
							border="0"
							cursor="pointer"
							p="1"
							borderRadius="sm"
							_hover={{ bg: 'gray.100' }}
						>
							<MoreVertical size="14" />
						</Box>
					</PopoverTrigger>
					<PopoverContent>
						<PopoverHeader fontSize="md" fontWeight="medium">
							Config for {properties.name}
						</PopoverHeader>
						<PopoverBody>
							<SimpleGrid alignItems="center" gap={2} columns={2}>
								{allVisibleProperties.map((property: any) => (
									<Fragment key={property.name}>
										<FormLabel>{property.name}</FormLabel>
										{property.type === 'boolean' ? (
											<InputRenderer
												{...property}
												value={properties[property.name]}
											/>
										) : (
											<Text fontSize="sm">
												{properties[property.name] || '-'}
											</Text>
										)}
									</Fragment>
								))}
							</SimpleGrid>
						</PopoverBody>
					</PopoverContent>
				</Popover>
			</Stack>
		</SimpleGrid>
	);
};

export const ColumnsProperties = () => {
	const toast = useToast();

	const { appName, pageName } = useParams();

	const tableId = useAtomValue(selectedTableIdAtom);
	const pageState = useAtomValue(newPageStateAtom);

	const { type, columns, isLoading, table } = useGetTable(tableId || '');

	const convertMutation = useConvertSmartTable({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'SmartTable converted',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to convert table',
				description: getErrorMessage(error),
			});
		},
	});

	const handleConvert = () => {
		convertMutation.mutate({
			table,
			state: pageState.state,
			appName,
			pageName,
		});
	};

	if (isLoading) {
		return (
			<Stack p="3">
				<Skeleton
					startColor="gray.100"
					endColor="gray.200"
					w="36"
					h="10"
					borderRadius="sm"
				/>
				<Stack p="3" bg="white">
					<Stack borderWidth="1px" spacing="0" divider={<Divider />}>
						<Skeleton startColor="gray.50" endColor="gray.100" h="10" />
						<Skeleton startColor="gray.50" endColor="gray.100" h="10" />
						<Skeleton startColor="gray.50" endColor="gray.100" h="10" />
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack h="full" overflowY="auto">
			{type === 'sql' && !table?.smart ? (
				<Button
					leftIcon={<Zap size="14" />}
					size="sm"
					colorScheme="yellow"
					onClick={handleConvert}
					isLoading={convertMutation.isLoading}
					mr="auto"
					variant="ghost"
				>
					Convert to Smart Table
				</Button>
			) : null}

			{columns.length > 0 ? (
				<Stack>
					<SimpleGrid
						py="2"
						fontWeight="medium"
						fontSize="sm"
						borderBottomWidth="1px"
						columns={3}
					>
						<Text>Column</Text>
						<Text>Editable</Text>
						<Text>Hidden</Text>
					</SimpleGrid>
					{columns.map((column: any) => (
						<ColumnProperty tableType={type} key={column.name} {...column} />
					))}
				</Stack>
			) : null}
		</Stack>
	);
};
