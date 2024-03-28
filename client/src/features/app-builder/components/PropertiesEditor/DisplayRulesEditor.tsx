import { useState, useEffect } from 'react';
import { Plus, Trash } from 'react-feather';
import { Box, Button, FormControl, FormLabel, IconButton, Stack, Text } from '@chakra-ui/react';
import { Controller, useFormContext } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';
import {
	AutoComplete,
	AutoCompleteInput,
	AutoCompleteItem,
	AutoCompleteList,
} from '@choc-ui/chakra-autocomplete';
import { pageAtom, useGetPage } from '@/features/page';
import { InputRenderer } from '@/components/FormInput';
import { pageStateAtom } from '@/features/app-state';

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
	displayRules,
	getColType,
	isInvalid,
	getComponentProperty,
	targets,
}: any) => {
	const [editTarget, setEditTarget] = useState<string>(rule.target);

	const targetExists = () => {
		if (!rule.target) {
			return true;
		}
		return targets?.flat().some((t: any) => t.value === rule.target);
	};

	const getTargetType = (target: string) => {
		const componentProperty = getComponentProperty(target);

		if (!target) return 'text';
		if (componentProperty?.component_type === 'select' && componentProperty?.multiple) {
			return 'string_array';
		}
		return getColType(target);
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
								target_type: getTargetType(item.value),
							};
						}

						return r;
					}),
				);
				setEditTarget(item.value);
			}}
		>
			<FormControl isInvalid={isInvalid}>
				<FormLabel {...formLabelProps}>Target</FormLabel>
				<AutoCompleteInput
					size="sm"
					value={editTarget}
					data-cy="display-rule-target"
					borderWidth={!targetExists() ? '2px' : null}
					borderColor={!targetExists() ? 'orange.300' : null}
					onChange={(e: any) => {
						setEditTarget(e.target.value);
					}}
					submitKeys={['Enter']}
				/>
				{!targetExists() && (
					<Text mt="1" fontSize="xs" color="orange.500">
						Target does not exist. This rule will not work.
					</Text>
				)}
			</FormControl>
			<AutoCompleteList>
				{targets?.flat().map((target: any) => {
					return (
						<AutoCompleteItem key={target?.value} value={target?.value} fontSize="sm">
							{target?.label}
						</AutoCompleteItem>
					);
				})}
			</AutoCompleteList>
		</AutoComplete>
	);
};

export const DisplayRulesEditor = ({ name }: any) => {
	const { widgetName, widgets } = useAtomValue(pageAtom);
	const pageComponents = useAtomValue(pageStateAtom);
	const { appName, pageName } = useParams();
	const { properties } = useGetPage({ appName, pageName });
	const pageBlocks = properties?.blocks || {};

	const components = widgets?.find((w: any) => w.name === widgetName)?.components || [];

	const { control } = useFormContext();

	const componentsProperties = components
		.filter(
			(c: any) =>
				c.name !== name &&
				(c.component_type === 'select' ||
					c.component_type === 'input' ||
					c.component_type === 'boolean'),
		)
		.reduce((agg: any, c: any) => ({ ...agg, [c?.name]: c }), {});
	const getComponentProperty = (target: string) => {
		if (!target) return null;
		return componentsProperties?.[target.split('.')[1]];
	};

	const getColType = (target: string) => {
		if (!target) return 'text';

		const componentProperty = getComponentProperty(target);
		if (target.includes('widgets')) return componentProperty?.data_type;

		const [specificCategory, targetName] = target.split('.');
		const tableBlock = pageBlocks?.find((block: any) => block.name === specificCategory);
		const tableColumn = tableBlock?.columns?.find((col: any) => col.name === targetName);
		return tableColumn?.display_type;
	};

	const getInputType = (target?: string) => {
		if (!target) return 'text';
		const componentProperty = componentsProperties?.[target.split('.')[2]];
		if (target.includes('widgets') && componentProperty?.component_type === 'select') {
			return 'select';
		}
		const colType = getColType(target);
		if (colType === 'boolean') {
			return 'select';
		}

		return colType;
	};

	const getOptions = (target: string) => {
		if (!target) return null;
		const componentProperty = componentsProperties?.[target.split('.')[2]];
		if (getColType(target) === 'boolean') {
			return [
				{
					name: 'True',
					value: true,
				},
				{
					name: 'False',
					value: false,
				},
			];
		}
		if (target.includes('widgets') && componentProperty?.component_type === 'select') {
			return componentProperty?.options;
		}
		return null;
	};

	const targets = Object.keys(pageComponents).map((componentName) => {
		const targetComponent: any = pageComponents?.[componentName as keyof typeof pageComponents];
		return Object.keys(targetComponent || {})?.map((componentAttribute) => ({
			label: `${componentName}.${componentAttribute}`,
			value: `${componentName}.${componentAttribute}`,
		}));
	});

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
								let usesComparatorOps = false;

								const targetType = getColType(rule.target);

								if (
									NUMBER_TYPES.includes(targetType) ||
									DATETIME_TYPES.includes(targetType)
								) {
									usesComparatorOps = true;
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
											targets={targets}
											displayRules={displayRules}
											getColType={getColType}
											isInvalid={!isValid && isSubmitted && !rule.target}
											getComponentProperty={getComponentProperty}
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
													data-cy="display-rule-operator"
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
														type={getInputType(rule.target)}
														value={rule.value}
														options={getOptions(rule.target)}
														data-cy="display-rule-value"
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
								data-cy="add-display-rule"
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
