import { Plus, Trash } from 'react-feather';
import { Badge, Box, Button, FormControl, FormLabel, IconButton, Stack } from '@chakra-ui/react';
import { Controller, useFormContext } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
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

const TargetSelector = ({ rule, index, onChange, displayRules, componentNames }: any) => {
	const { widgets } = useAtomValue(pageAtom);
	const tableState = useAtomValue(tableStateAtom);
	const [category, setCategory] = useState<string>('widget');
	const [specificCategory, setSpecificCategory] = useState<string>('');

	const compilePathName = (target: string) => {
		return `${category}s.${specificCategory}.${target}`;
	};

	const getCategoryOptions = () => {
		if (category === 'table') {
			return Object.keys(tableState).map((c: any) => ({
				name: c,
				value: c,
			}));
		}

		return widgets?.map((c: any) => ({
			name: c.name,
			value: c.name,
		}));
	};
	const getSpecificCategoryOptions = () => {
		if (category === 'table') {
			const table: any = tableState?.[specificCategory as keyof typeof tableState];
			return Object.keys(table || {}).map((c: any) => ({
				name: c,
				value: compilePathName(c),
			}));
		}

		return componentNames.map((c: any) => ({
			name: c,
			value: compilePathName(c),
		}));
	};
	return (
		<Stack alignItems="end" key={rule.id} direction="row">
			<FormControl>
				{index === 0 ? <FormLabel {...formLabelProps}>Category</FormLabel> : null}
				<InputRenderer
					size="sm"
					flex="1"
					type="select"
					placeholder="Category"
					value={rule.name}
					options={[
						{
							name: 'Tables',
							value: 'table',
						},
						{
							name: 'Widgets',
							value: 'widget',
						},
					]}
					onChange={(newValue: any) => {
						setCategory(newValue);
					}}
				/>
			</FormControl>
			<FormControl>
				{index === 0 ? <FormLabel {...formLabelProps}>Name</FormLabel> : null}
				<InputRenderer
					size="sm"
					flex="1"
					type="select"
					placeholder="Category"
					value={rule.name}
					options={getCategoryOptions()}
					onChange={(newValue: any) => {
						setSpecificCategory(newValue);
					}}
				/>
			</FormControl>
			<FormControl>
				{index === 0 ? <FormLabel {...formLabelProps}>Target</FormLabel> : null}
				<InputRenderer
					size="sm"
					flex="1"
					type="select"
					placeholder="component name"
					value={rule.target}
					options={getSpecificCategoryOptions()}
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
		</Stack>
	);
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
										<TargetSelector
											rule={rule}
											index={index}
											onChange={onChange}
											displayRules={displayRules}
											componentNames={componentNames}
										/>
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
