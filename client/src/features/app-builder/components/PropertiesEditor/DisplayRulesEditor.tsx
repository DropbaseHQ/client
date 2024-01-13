import { Plus, Trash, Crosshair } from 'react-feather';
import {
	Box,
	Button,
	FormControl,
	FormLabel,
	IconButton,
	Stack,
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionPanel,
	AccordionIcon,
	MenuButton,
	MenuList,
	Menu,
	MenuItem,
	InputGroup,
	InputRightElement,
	Select,
	Portal,
	Collapse,
} from '@chakra-ui/react';
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

const TargetSelector = ({ rule, onChange, displayRules }: any) => {
	const { widgets } = useAtomValue(pageAtom);
	const tableState = useAtomValue(tableStateAtom);

	const stateCategory = ['tables', 'widgets'];

	const compilePathName = (chosenCat: string, chosenSpecificCat: string, target: string) => {
		return `${chosenCat}.${chosenSpecificCat}.${target}`;
	};

	const getCategoryOptions = (chosenCat: string) => {
		if (chosenCat === 'tables') {
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
	const getSpecificCategoryOptions = (chosenCat: string, chosenSpecificCat: string) => {
		if (chosenCat === 'tables') {
			const table: any = tableState?.[chosenSpecificCat as keyof typeof tableState];
			return Object.keys(table || {}).map((c: any) => ({
				name: c,
				value: compilePathName(chosenCat, chosenSpecificCat, c),
			}));
		}

		const chosenWidget = widgets?.find((w: any) => w.name === chosenSpecificCat);
		return chosenWidget?.components.map((c: any) => ({
			name: c.name,
			value: compilePathName(chosenCat, chosenSpecificCat, c.name),
		}));
	};

	const Collapsible = ({ comp, optionGetter }: any) => {
		const [isOpen, setIsOpen] = useState(false);
		const toggleCollapsible = () => setIsOpen(!isOpen);
		return (
			<>
				<Box
					onClick={toggleCollapsible}
					ml="1"
					display="flex"
					cursor="pointer"
					pr="2"
					pl="2"
					pb="1"
					_hover={{ bg: 'gray.50' }}
					borderLeftWidth="2px"
					alignItems="center"
				>
					{/* <Divider w="2" borderWidth="1px" px="0" mr="1" /> */}
					{comp}
				</Box>
				<Collapse in={isOpen} animateOpacity>
					{optionGetter().map((c: any) => (
						<MenuItem
							icon={<Crosshair size="12" />}
							key={c.name}
							py="0"
							ml="1"
							borderLeftWidth="2px"
							onClick={() => {
								onChange(
									displayRules.map((r: any) => {
										if (r.id === rule.id) {
											return {
												...r,
												target: c.value,
											};
										}

										return r;
									}),
								);
								setIsOpen(false);
							}}
						>
							{/* <Box borderLeftWidth="2px" pl="2" display="flex" alignItems="center"> */}
							{/* <Divider w="2" borderWidth="1px" px="0" mr="1" /> */}
							{c.name}
							{/* </Box> */}
						</MenuItem>
					))}
				</Collapse>
			</>
		);
	};

	return (
		<Stack alignItems="end" key={rule.id} direction="row">
			<Menu gutter={0} matchWidth>
				<InputGroup>
					<MenuButton w="full" onClick={(e) => e.stopPropagation()}>
						<Select w="full" size="sm" placeholder={rule.target} />
					</MenuButton>
					<InputRightElement>
						<Portal>
							<MenuList w="full">
								<Accordion allowToggle>
									{stateCategory.map((chosenCat: any) => {
										return (
											<AccordionItem>
												<h2>
													<AccordionButton>
														<Box as="span" flex="1" textAlign="left">
															{chosenCat}
														</Box>
														<AccordionIcon />
													</AccordionButton>
												</h2>
												<AccordionPanel pb={4}>
													{getCategoryOptions(chosenCat)?.map(
														(c: any) => (
															<Collapsible
																key={c.name}
																comp={c.name}
																optionGetter={() =>
																	getSpecificCategoryOptions(
																		chosenCat,
																		c.name,
																	)
																}
															/>
														),
													)}
												</AccordionPanel>
											</AccordionItem>
										);
									})}
								</Accordion>
							</MenuList>
						</Portal>
					</InputRightElement>
				</InputGroup>
			</Menu>
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
