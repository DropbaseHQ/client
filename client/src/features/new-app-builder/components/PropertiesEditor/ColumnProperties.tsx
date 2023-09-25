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
} from '@chakra-ui/react';
import { InputRenderer } from '@/components/FormInput';
import {
	useConvertSmartTable,
	useGetColumnProperties,
	useUpdateColumnProperties,
} from '@/features/new-app-builder/hooks';
import { pageAtom } from '@/features/new-page';
import { useToast } from '@/lib/chakra-ui';

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
	const { tableId } = useAtomValue(pageAtom);
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
				<Stack p="2">
					{schema
						.filter((property: any) =>
							DISPLAY_COLUMN_PROPERTIES.includes(property.name),
						)
						.map((property: any) => (
							<FormControl key={property.name}>
								<FormLabel>{property.name}</FormLabel>
								<InputRenderer {...property} value={properties[property.name]} />
							</FormControl>
						))}
				</Stack>
			</AccordionPanel>
		</AccordionItem>
	);
};

export const ColumnsProperties = () => {
	const toast = useToast();
	const { tableId } = useAtomValue(pageAtom);
	const { isLoading, values } = useGetColumnProperties(tableId || '');

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
		<Stack h="full" p="3" overflowY="auto">
			<Button
				leftIcon={<Zap size="14" />}
				size="sm"
				colorScheme="yellow"
				onClick={handleConvert}
				isLoading={convertMutation.isLoading}
				mr="auto"
				variant="ghost"
			>
				Convert to AI Table
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
