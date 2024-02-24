import { useMemo, useState, useEffect } from 'react';
import { Plus, Trash } from 'react-feather';
import { Box, Button, FormControl, FormLabel, IconButton, Stack, Text } from '@chakra-ui/react';
import { Controller, useFormContext } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import {
	AutoComplete,
	AutoCompleteInput,
	AutoCompleteItem,
	AutoCompleteList,
	AutoCompleteGroup,
	AutoCompleteGroupTitle,
} from '@choc-ui/chakra-autocomplete';
import { pageAtom } from '@/features/page';
import { InputRenderer } from '@/components/FormInput';
import { allWidgetsInputAtom, tableColumnTypesAtom, tableStateAtom } from '@/features/app-state';

const NUMBER_TYPES = ['number', 'integer', 'float'];
const DATETIME_TYPES = ['datetime', 'date', 'time'];
const OPERATORS = [
	{
		name: 'Equal to',
		value: 'equals',
	},
	{
		name: 'Not equal to',
		value: 'not_equals',
	},
	{
		name: 'Exists',
		value: 'exists',
	},
];
const OPERATOR_WITH_NO_VALUE = ['exists'];
const COMPERATOR_OPERATORS = [
	{
		name: 'Less than',
		value: 'lt',
	},
	{
		name: 'Less than and equal to',
		value: 'lte',
	},
	{
		name: 'Greater than',
		value: 'gt',
	},
	{
		name: 'Greater than and equal to',
		value: 'gte',
	},
];

const formLabelProps = {
	letterSpacing: 'wide',
	fontSize: 'xs',
	fontWeight: 'semibold',
	mb: '1',
};

const TargetSelector = ({
	rule,
	onChange,
	tableTargets,
	widgetTargets,
	displayRules,
	getColType,
	isInvalid,
}: any) => {
	const [editTarget, setEditTarget] = useState<string>(rule.target);

	const targetExists = () => {
		if (!rule.target) {
			return true;
		}
		const [category] = rule.target.split('.');
		if (category === 'tables') {
			return tableTargets?.some((t: any) => t.value === rule.target);
		}
		return widgetTargets?.some((t: any) => t.value === rule.target);
	};

	useEffect(() => {
		setEditTarget(rule.target);
	}, [rule.target]);

	return (
		<AutoComplete
			onSelectOption={({ item }: any) => {
				onChange(
					displayRules.map((r: any) => {
						if (r.id === rule.id) {
							return {
								...r,
								target: item.value,
								target_type: getColType(item.value),
							};
						}

						return r;
					}),
				);
			}}
		>
			<FormControl isInvalid={isInvalid}>
				<FormLabel {...formLabelProps}>Target</FormLabel>
				<AutoCompleteInput
					size="sm"
					value={editTarget}
					borderWidth={!targetExists() ? '2px' : null}
					borderColor={!targetExists() ? 'orange.300' : null}
					onChange={(e: any) => {
						setEditTarget(e.target.value);
					}}
				/>
				{!targetExists() && (
					<Text mt="1" fontSize="xs" color="orange.500">
						Target does not exist. This rule will not work.
					</Text>
				)}
			</FormControl>
			<AutoCompleteList>
				<AutoCompleteGroup key="tables" showDivider>
					<AutoCompleteGroupTitle>Tables</AutoCompleteGroupTitle>
					{tableTargets?.map((xTable: any) => {
						return (
							<AutoCompleteItem
								key={xTable?.value}
								value={xTable?.value}
								fontSize="sm"
							>
								{xTable?.label}
							</AutoCompleteItem>
						);
					})}
				</AutoCompleteGroup>
				<AutoCompleteGroup key="widgets" showDivider>
					<AutoCompleteGroupTitle>Widgets</AutoCompleteGroupTitle>
					{widgetTargets?.map((widgetTarget: any) => {
						return (
							<AutoCompleteItem
								key={widgetTarget.value}
								value={widgetTarget.value}
								fontSize="sm"
							>
								{widgetTarget.label}
							</AutoCompleteItem>
						);
					})}
				</AutoCompleteGroup>
			</AutoCompleteList>
		</AutoComplete>
	);
};

const compilePathName = (category: string, specificCategory: string, target: string) => {
	return `${category}.${specificCategory}.${target}`;
};

export const DisplayRulesEditor = ({ name }: any) => {
	const { widgetName, widgets } = useAtomValue(pageAtom);
	const widgetsInputs = useAtomValue(allWidgetsInputAtom);
	const tableState = useAtomValue(tableStateAtom);
	const tableColumnTypes = useAtomValue(tableColumnTypesAtom);

	const currentWidget: { [key: string]: any } =
		widgetsInputs?.[widgetName as keyof typeof widgetsInputs] || {};

	const components = widgets?.find((w: any) => w.name === widgetName)?.components || [];
	const { control } = useFormContext();

	const getColType = (target: string, componentProperty?: any) => {
		if (!target) return 'text';

		if (target.includes('widgets')) return componentProperty?.data_type;

		const [, specificCategory, targetName] = target.split('.');
		const table = tableColumnTypes?.[specificCategory as keyof typeof tableColumnTypes];
		return table?.[targetName as keyof typeof table];
	};
	const componentsProperties = components
		.filter(
			(c: any) =>
				c.name !== name && (c.component_type === 'select' || c.component_type === 'input'),
		)
		.reduce((agg: any, c: any) => ({ ...agg, [c?.name]: c }), {});

	const tableTargets = useMemo(() => {
		return Object.keys(tableState)
			.map((tableName: any) => {
				const targetTable: any = tableState?.[tableName as keyof typeof tableState];
				return Object.keys(targetTable || {})?.map((c: any) => ({
					label: `${tableName}.${c}`,
					value: compilePathName('tables', tableName, c),
				}));
			})
			.flat();
	}, [tableState]);

	const widgetTargets = Object.keys(currentWidget)?.map((c: any) => ({
		label: `${widgetName}.${c}`,
		value: compilePathName('widgets', widgetName || '', c),
	}));

	return (
		<FormControl>
			<Controller
				control={control}
				name="display_rules"
				rules={{
					validate: (displayRules) => {
						if (displayRules?.length > 0) {
							const isValid = displayRules.every((rule: any) => {
								if (
									rule?.operator &&
									OPERATOR_WITH_NO_VALUE.includes(rule?.operator)
								) {
									return !!rule.target;
								}
								return rule.target && rule.operator && rule.value;
							});
							if (!isValid) {
								return 'All rule fields must be complete';
							}
						}
						return true;
					},
				}}
				render={({
					field: { onChange, value },
					fieldState: { error },
					formState: { isValid, isSubmitted },
				}) => {
					const displayRules = value || [];
					return (
						<Stack spacing="2.5">
							{displayRules.map((rule: any, index: any) => {
								const ruleName = rule?.target?.split('.')?.[2];
								const componentProperty = componentsProperties?.[ruleName];
								let usesComparatorOps = false;
								let input: any = {
									type: 'text',
								};

								if (
									NUMBER_TYPES.includes(
										getColType(rule.target, componentProperty),
									)
								) {
									usesComparatorOps = true;
								}

								if (
									NUMBER_TYPES.includes(componentProperty?.data_type) ||
									DATETIME_TYPES.includes(componentProperty?.data_type)
								) {
									usesComparatorOps = true;
									if (componentProperty?.component_type === 'input') {
										input = {
											type: 'number',
										};
									} else if (componentProperty?.component_type === 'select') {
										input = {
											type: 'select',
											options: componentProperty?.property?.options || [],
										};
									}
								}

								return (
									<Stack key={rule.id} direction="column" spacing="2">
										{index === 0 ? null : (
											<Box w="20" alignSelf="center">
												<InputRenderer
													size="sm"
													flex="1"
													type="select"
													placeholder="Andor"
													value={rule?.andor}
													options={[
														{
															name: 'And',
															value: 'and',
														},
														{
															name: 'Or',
															value: 'or',
														},
													]}
													onChange={(newValue: any) => {
														onChange(
															displayRules.map((r: any) => {
																if (r.id === rule.id) {
																	return {
																		...r,
																		andor: newValue,
																	};
																}

																return r;
															}),
														);
													}}
												/>
											</Box>
										)}

										<TargetSelector
											rule={rule}
											onChange={onChange}
											tableTargets={tableTargets}
											widgetTargets={widgetTargets}
											displayRules={displayRules}
											getColType={getColType}
											isInvalid={!isValid && isSubmitted && !rule.target}
										/>

										<Stack alignItems="end" key={rule.id} direction="row">
											<FormControl
												isInvalid={
													!isValid && isSubmitted && !rule.operator
												}
											>
												{index === 0 ? (
													<FormLabel {...formLabelProps}>
														Operator
													</FormLabel>
												) : null}
												<InputRenderer
													size="sm"
													flex="1"
													type="select"
													placeholder="Operator"
													value={rule.operator}
													options={[
														...OPERATORS,
														...(usesComparatorOps
															? COMPERATOR_OPERATORS
															: []),
													]}
													onChange={(newValue: any) => {
														onChange(
															displayRules.map((r: any) => {
																if (r.id === rule.id) {
																	return {
																		...r,
																		operator: newValue,
																	};
																}

																return r;
															}),
														);
													}}
												/>
											</FormControl>
											{OPERATOR_WITH_NO_VALUE.includes(
												rule.operator,
											) ? null : (
												<FormControl
													isInvalid={
														!isValid && isSubmitted && !rule.value
													}
												>
													{index === 0 ? (
														<FormLabel {...formLabelProps}>
															Value
														</FormLabel>
													) : null}
													<InputRenderer
														size="sm"
														flex="1"
														disabled={!rule.target}
														placeholder="select value"
														{...input}
														type={getColType(
															rule.target,
															componentProperty,
														)}
														value={rule.value}
														onChange={(newValue: any) => {
															onChange(
																displayRules.map((r: any) => {
																	if (r.id === rule.id) {
																		return {
																			...r,
																			value: newValue,
																		};
																	}

																	return r;
																}),
															);
														}}
													/>
												</FormControl>
											)}
											<IconButton
												aria-label="Delete"
												icon={<Trash size="14" />}
												size="sm"
												variant="ghost"
												colorScheme="red"
												onClick={() => {
													onChange(
														displayRules.filter(
															(o: any) => o.id !== rule.id,
														),
													);
												}}
											/>
										</Stack>
									</Stack>
								);
							})}
							{error && (
								<Text fontSize="sm" color="red">
									{error?.message}
								</Text>
							)}

							<Button
								size="sm"
								leftIcon={<Plus size="14" />}
								variant="outline"
								colorScheme="gray"
								onClick={() => {
									onChange(
										displayRules?.length > 0
											? [
													...displayRules,
													{
														target: null,
														value: null,
														operator: null,
														andor: 'and',
														id: crypto.randomUUID(),
													},
											  ]
											: [
													{
														target: null,
														value: null,
														operator: null,
														id: crypto.randomUUID(),
													},
											  ],
									);
								}}
							>
								Add rule
							</Button>
						</Stack>
					);
				}}
			/>
		</FormControl>
	);
};
