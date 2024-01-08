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
} from '@chakra-ui/react';
import { InputRenderer } from '@/components/FormInput';
import {
	useConvertSmartTable,
	useGetColumnProperties,
	useGetTable,
	useUpdateColumnProperties,
} from '@/features/app-builder/hooks';
import { useToast } from '@/lib/chakra-ui';
import { selectedTableIdAtom } from '@/features/app-builder/atoms';
import { newPageStateAtom } from '@/features/app-state';
import { getErrorMessage } from '@/utils';

const DISPLAY_COLUMN_PROPERTIES = [
	'schema_name',
	'table_name',
	'primary_key',
	'foreign_key',
	'nullable',
	'unique',
];

const ColumnProperty = ({ id, property: properties, type }: any) => {
	const toast = useToast();
	const tableId = useAtomValue(selectedTableIdAtom);

	const { schema, refetch } = useGetColumnProperties(tableId || '');

	const mutation = useUpdateColumnProperties({
		onSuccess: () => {
			refetch();
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
		mutation.mutate({
			columnId: id,
			payload: { ...properties, ...partialValues },
			type,
		});
	};

	const hasNoEditKeys = properties.edit_keys?.length === 0;

	const allVisibleProperties = schema.filter((property: any) =>
		DISPLAY_COLUMN_PROPERTIES.includes(property.name),
	);

	return (
		<SimpleGrid alignItems="center" gap={3} columns={3}>
			<Box overflow="hidden">
				<Tooltip placement="left-end" label={properties.name}>
					<Text
						fontSize="sm"
						whiteSpace="nowrap"
						w="full"
						overflow="hidden"
						textOverflow="ellipsis"
						size="sm"
					>
						{properties.name}
					</Text>
				</Tooltip>
			</Box>
			<Tooltip label={hasNoEditKeys ? 'Not editable' : ''}>
				<Box>
					<InputRenderer
						type="boolean"
						isDisabled={type !== 'postgres' || hasNoEditKeys || mutation.isLoading}
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
					id="visible"
					isDisabled={mutation.isLoading}
					value={properties.visible}
					onChange={(newValue: any) => {
						handleUpdate({
							visible: newValue,
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
						<PopoverHeader fontSize="sm" fontWeight="medium">
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

	const { type, file_id: defaultFileId } = useGetTable(tableId || '');

	const { isLoading, values } = useGetColumnProperties(tableId || '');

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
			// FIXME: fix file anmd table
			// file,
			// table,
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
			{type === 'sql' ? (
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
					<Text>Visible</Text>
				</SimpleGrid>
				{values
					.sort((a: any, b: any) => a?.property?.name.localeCompare(b?.property?.name))
					.map((value: any) => (
						<ColumnProperty key={value.id} {...value} />
					))}
			</Stack>
		</Stack>
	);
};
