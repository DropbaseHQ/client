import { Zap } from 'react-feather';
import { useAtomValue } from 'jotai';
import {
	Stack,
	Box,
	Skeleton,
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionIcon,
	AccordionPanel,
	Text,
	Tooltip,
	FormLabel,
	FormControl,
	Spinner,
	Button,
	Divider,
	SimpleGrid,
} from '@chakra-ui/react';
import { InputRenderer } from '@/components/FormInput';
import {
	useConvertSmartTable,
	useGetColumnProperties,
	useUpdateColumnProperties,
} from '@/features/new-app-builder/hooks';
import { useToast } from '@/lib/chakra-ui';
import { selectedTableIdAtom } from '@/features/new-app-builder/atoms';
import { newPageStateAtom } from '@/features/new-app-state';

const DISPLAY_COLUMN_PROPERTIES = [
	'schema_name',
	'table_name',
	'primary_key',
	'foreign_key',
	'nullable',
	'unique',
];

const ColumnProperty = ({ id, property: properties }: any) => {
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
	});

	const handleUpdate = (partialValues: any) => {
		mutation.mutate({
			columnId: id,
			payload: { ...properties, ...partialValues },
			type: 'postgres',
		});
	};

	const hasNoEditKeys = properties.edit_keys?.length === 0;

	const allVisibleProperties = schema.filter((property: any) =>
		DISPLAY_COLUMN_PROPERTIES.includes(property.name),
	);

	const nonBooleanProperties = allVisibleProperties.filter((p: any) => p.type !== 'boolean');
	const booleanProperties = allVisibleProperties.filter((p: any) => p.type === 'boolean');

	return (
		<AccordionItem>
			<AccordionButton w="full">
				{mutation.isLoading ? <Spinner size="sm" /> : <AccordionIcon />}

				<Stack flex="1" ml="4" alignItems="center" direction="row">
					<Text size="sm">{properties.name}</Text>

					<Stack
						minW="48"
						ml="auto"
						spacing="4"
						justifyContent="space-around"
						direction="row"
						alignItems="center"
					>
						<Tooltip label={hasNoEditKeys ? 'Not editable' : ''}>
							<Box>
								<InputRenderer
									type="boolean"
									isDisabled={hasNoEditKeys || mutation.isLoading}
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
						<Box>
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
						</Box>
					</Stack>
				</Stack>
			</AccordionButton>
			<AccordionPanel borderTopWidth="1px">
				<Stack py="2" px="8">
					{nonBooleanProperties.map((property: any) => (
						<FormControl key={property.name}>
							<FormLabel>{property.name}</FormLabel>
							<InputRenderer {...property} value={properties[property.name]} />
						</FormControl>
					))}

					<SimpleGrid columns={2} spacing={2}>
						{booleanProperties.map((property: any) => (
							<FormControl key={property.name}>
								<FormLabel>{property.name}</FormLabel>
								<InputRenderer {...property} value={properties[property.name]} />
							</FormControl>
						))}
					</SimpleGrid>
				</Stack>
			</AccordionPanel>
		</AccordionItem>
	);
};

export const ColumnsProperties = () => {
	const toast = useToast();
	const tableId = useAtomValue(selectedTableIdAtom);
	const { isLoading, values } = useGetColumnProperties(tableId || '');
	const state = useAtomValue(newPageStateAtom);

	const convertMutation = useConvertSmartTable({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'SmartTable converted',
			});
		},
	});

	const handleConvert = () => {
		if (tableId)
			convertMutation.mutate({
				tableId,
				state: state.state.tables,
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
		<Stack h="full" px="3" overflowY="auto">
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
			<Accordion bg="white" borderLeftWidth="1px" borderRightWidth="1px" allowMultiple>
				<Stack
					fontWeight="medium"
					color="gray.600"
					p="2"
					borderTopWidth="1px"
					direction="row"
				>
					<Text ml="10">Column</Text>
					<Stack minW="52" justifyContent="space-around" ml="auto" direction="row">
						<Text>Editable</Text>
						<Text>Visible</Text>
					</Stack>
				</Stack>
				{values.map((value: any) => (
					<ColumnProperty key={value.id} {...value} />
				))}
			</Accordion>
		</Stack>
	);
};
