import { useMemo, useState, useEffect } from 'react';
import { Plus, Trash } from 'react-feather';
import { Box, Button, FormControl, FormLabel, IconButton, Stack } from '@chakra-ui/react';
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
import { tableStateAtom } from '@/features/app-state';

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
		name: 'exists',
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

const TargetSelector = ({ rule, onChange, tableTargets, widgetTargets, displayRules }: any) => {
	const [editTarget, setEditTarget] = useState<string>(rule.target);

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
							};
						}

						return r;
					}),
				);
			}}
		>
			<FormControl>
				<FormLabel {...formLabelProps}>Target</FormLabel>
				<AutoCompleteInput
					size="sm"
					value={editTarget}
					onChange={(e: any) => {
						setEditTarget(e.target.value);
					}}
				/>
			</FormControl>
			<AutoCompleteList>
				<AutoCompleteGroup key="tables" showDivider>
					<AutoCompleteGroupTitle>Tables</AutoCompleteGroupTitle>
					{tableTargets?.map((xTable: any) => {
						return (
							<AutoCompleteItem key={xTable?.value} value={xTable?.value}>
								{xTable?.label}
							</AutoCompleteItem>
						);
					})}
				</AutoCompleteGroup>
				<AutoCompleteGroup key="widgets" showDivider>
					<AutoCompleteGroupTitle>Widgets</AutoCompleteGroupTitle>
					{widgetTargets?.map((widgetTarget: any) => {
						return (
							<AutoCompleteItem key={widgetTarget.value} value={widgetTarget.value}>
								{widgetTarget.label}
							</AutoCompleteItem>
						);
					})}
				</AutoCompleteGroup>
			</AutoCompleteList>
		</AutoComplete>
	);
};

export const DisplayRulesEditor = ({ name }: any) => {
	const { widgetName, widgets } = useAtomValue(pageAtom);
	const tableState = useAtomValue(tableStateAtom);
	const currentWidget = widgets?.find((w: any) => w.name === widgetName);

	const compilePathName = (category: string, specificCategory: string, target: string) => {
		return `${category}.${specificCategory}.${target}`;
	};

	const components = widgets?.find((w: any) => w.name === widgetName)?.components || [];
	const { control } = useFormContext();

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

	const widgetTargets = currentWidget?.components.map((c: any) => ({
		label: `${currentWidget?.name}.${c.name}`,
		value: compilePathName('widgets', currentWidget?.name, c.name),
	}));

	return (
		<FormControl>
			<Controller
				control={control}
				name="display_rules"
				render={({ field: { onChange, value } }) => {
					const displayRules = value || [];

					return (
						<Stack spacing="2.5">
							{displayRules.map((rule: any, index: any) => {
								const componentProperty = componentsProperties?.[rule?.name];

								let isNumberInput = false;

								let input: any = {
									type: 'text',
								};

								if (componentProperty?.type === 'input') {
									if (componentProperty?.property?.type === 'number') {
										input = {
											type: 'number',
										};
										isNumberInput = true;
									}
								} else if (componentProperty?.type === 'select') {
									input = {
										type: 'select',
										options: componentProperty?.property?.options || [],
									};
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
										/>
										{/* <AutoComplete
											onSelectOption={({ item }: any) => {
												onChange(
													displayRules.map((r: any) => {
														if (r.id === rule.id) {
															return {
																...r,
																target: item.value,
															};
														}

														return r;
													}),
												);
											}}
										>
											<FormControl>
												<FormLabel {...formLabelProps}>Target</FormLabel>
												<AutoCompleteInput size="sm" value={rule.target} />
											</FormControl>
											<AutoCompleteList>
												<AutoCompleteGroup key="tables" showDivider>
													<AutoCompleteGroupTitle>
														Tables
													</AutoCompleteGroupTitle>
													{tableTargets?.map((xTable: any) => {
														return (
															<AutoCompleteItem
																key={xTable?.value}
																value={xTable?.value}
															>
																{xTable?.label}
															</AutoCompleteItem>
														);
													})}
												</AutoCompleteGroup>
												<AutoCompleteGroup key="widgets" showDivider>
													<AutoCompleteGroupTitle>
														Widgets
													</AutoCompleteGroupTitle>
													{widgetTargets?.map((widgetTarget: any) => {
														return (
															<AutoCompleteItem
																key={widgetTarget.value}
																value={widgetTarget.value}
															>
																{widgetTarget.label}
															</AutoCompleteItem>
														);
													})}
												</AutoCompleteGroup>
											</AutoCompleteList>
										</AutoComplete> */}
										<Stack alignItems="end" key={rule.id} direction="row">
											<FormControl>
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
														...(isNumberInput
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
												<FormControl>
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
