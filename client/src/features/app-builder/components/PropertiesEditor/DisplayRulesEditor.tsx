import { Plus, Trash } from 'react-feather';
import { Badge, Box, Button, FormControl, FormLabel, IconButton, Stack } from '@chakra-ui/react';
import { Controller, useFormContext } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { pageAtom } from '@/features/page';
import { InputRenderer } from '@/components/FormInput';

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

export const DisplayRulesEditor = ({ name }: any) => {
	const { widgetName, widgets } = useAtomValue(pageAtom);
	const components = widgets?.find((w: any) => w.name === widgetName)?.components || [];
	const { control } = useFormContext();
	const componentsProperties = components
		.filter(
			(c: any) =>
				c.name !== name && (c.component_type === 'select' || c.component_type === 'input'),
		)
		.reduce((agg: any, c: any) => ({ ...agg, [c?.name]: c }), {});
	const componentNames = Object.keys(componentsProperties);

	const compilePathName = (target: string) => {
		return `widgets.${widgetName}.${target}`;
	};

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
									<Stack alignItems="end" key={rule.id} direction="row">
										{index === 0 ? null : (
											<Box w="8" alignSelf="center">
												<Badge
													colorScheme="gray"
													variant="subtle"
													size="xs"
												>
													And
												</Badge>
											</Box>
										)}
										<FormControl>
											{index === 0 ? (
												<FormLabel {...formLabelProps}>Component</FormLabel>
											) : null}
											<InputRenderer
												size="sm"
												flex="1"
												type="select"
												placeholder="component name"
												value={rule.target}
												options={componentNames.map((c: any) => ({
													name: c,
													value: compilePathName(c),
												}))}
												onChange={(newValue: any) => {
													onChange(
														displayRules.map((r: any) => {
															if (r.id === rule.id) {
																return {
																	...r,
																	target: newValue,
																};
															}

															return r;
														}),
													);
												}}
											/>
										</FormControl>

										<FormControl>
											{index === 0 ? (
												<FormLabel {...formLabelProps}>Operator</FormLabel>
											) : null}
											<InputRenderer
												size="sm"
												flex="1"
												type="select"
												placeholder="Operator"
												value={rule.operator}
												options={[
													...OPERATORS,
													...(isNumberInput ? COMPERATOR_OPERATORS : []),
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
										{OPERATOR_WITH_NO_VALUE.includes(rule.operator) ? null : (
											<FormControl>
												{index === 0 ? (
													<FormLabel {...formLabelProps}>Value</FormLabel>
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
								);
							})}

							<Button
								size="sm"
								leftIcon={<Plus size="14" />}
								variant="outline"
								colorScheme="gray"
								onClick={() => {
									onChange([
										...displayRules,
										{
											target: null,
											value: null,
											operator: null,
											id: crypto.randomUUID(),
										},
									]);
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
