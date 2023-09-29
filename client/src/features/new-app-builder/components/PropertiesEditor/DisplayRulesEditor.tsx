import { Plus, Trash } from 'react-feather';
import { Badge, Box, Button, FormControl, FormLabel, IconButton, Stack } from '@chakra-ui/react';
import { Controller, useFormContext } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { useGetComponentProperties } from '@/features/new-app-builder/hooks';
import { pageAtom } from '@/features/new-page';
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

export const DisplayRulesEditor = ({ id }: any) => {
	const { widgetId } = useAtomValue(pageAtom);
	const { values: components } = useGetComponentProperties(widgetId || '');

	const { control } = useFormContext();

	const componentsProperties = components
		.filter((c: any) => c.id !== id && (c.type === 'select' || c.type === 'input'))
		.reduce((agg: any, c: any) => ({ ...agg, [c?.property?.name]: c }), {});

	const componentNames = Object.keys(componentsProperties);

	return (
		<FormControl>
			<FormLabel>Display Rules</FormLabel>

			<Controller
				control={control}
				name="display_rules"
				render={({ field: { onChange, value } }) => {
					const displayRules = value || [];

					return (
						<Stack p="3" borderWidth="1px" borderRadius="md" spacing="1">
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
									<Stack alignItems="center" key={rule.id} direction="row">
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
										<InputRenderer
											size="sm"
											flex="1"
											type="select"
											placeholder="component name"
											value={rule.name}
											options={componentNames.map((c: any) => ({
												name: c,
												value: c,
											}))}
											onChange={(newValue: any) => {
												onChange(
													displayRules.map((r: any) => {
														if (r.id === rule.id) {
															return {
																...r,
																name: newValue,
															};
														}

														return r;
													}),
												);
											}}
										/>
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
										{OPERATOR_WITH_NO_VALUE.includes(rule.operator) ? null : (
											<InputRenderer
												size="sm"
												flex="1"
												disabled={!rule.name}
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
								variant="ghost"
								colorScheme="blue"
								onClick={() => {
									onChange([
										...displayRules,
										{
											name: null,
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
