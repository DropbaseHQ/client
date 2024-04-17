import {
	Badge,
	Icon,
	Menu,
	MenuButton,
	MenuList,
	Portal,
	Stack,
	Text,
	Box,
	MenuOptionGroup,
	MenuItemOption,
	MenuDivider,
	MenuItem,
	FormLabel,
	FormControl,
	Code,
	Button,
} from '@chakra-ui/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { ChevronDown, Box as BoxIcon, Layout, Plus, Table as TableIcon } from 'react-feather';
import { Controller, useFormContext } from 'react-hook-form';

import { pageAtom, useGetPage } from '@/features/page';
import { useCreateWidget } from '@/features/app-builder/hooks';
import { generateSequentialName } from '@/utils';
import { inspectedResourceAtom } from '@/features/app-builder/atoms';
import { useFunctions } from '@/features/app-builder/hooks/files';

export const EventPropertyEditor = ({ id, title, showFetchersOnly = false, onSelect }: any) => {
	const { control } = useFormContext();

	const { pageName, appName, widgetName } = useAtomValue(pageAtom);
	const [{ id: componentId }, setInspectedResource] = useAtom(inspectedResourceAtom);

	const { widgets, isLoading, properties, tables } = useGetPage({ appName, pageName });

	const { functions } = useFunctions({ appName, pageName });

	const functionsToBeRendered = showFetchersOnly
		? functions
		: functions.filter((f: any) => f.type !== 'sql');

	const createMutation = useCreateWidget();

	const setPageAtom = useSetAtom(pageAtom);

	const modalWidgets = widgets
		.filter((f: any) => f.type === 'modal')
		?.map((f: any) => ({ value: f?.name, type: 'widget', label: f?.label }));

	const baseWidgets = widgets
		.filter((f: any) => f.type === 'base')
		?.map((f: any) => ({ value: f?.name, type: 'widget', label: f?.label }));

	const allTables = tables?.map((f: any) => ({
		value: f?.name,
		type: 'table',
		label: f?.label,
	}));

	const allOptions = [...functionsToBeRendered, ...modalWidgets, ...baseWidgets, ...allTables];

	const optionValueRenderer = ({ option, showBadge }: any) => {
		const selectedValue = (allOptions || [])?.find((o: any) => {
			return option.type === o.type && o.value === option.value;
		});

		if (!selectedValue) {
			return null;
		}

		let icon = Layout;
		let badge = {
			color: 'purple',
			children: 'UI Function',
		};

		if (selectedValue.type === 'function') {
			icon = BoxIcon;
		} else if (selectedValue.type === 'table') {
			icon = TableIcon;
			badge = {
				color: 'blue',
				children: 'Table',
			};
		}

		const isWidget = selectedValue?.type === 'widget';

		if (isWidget) {
			const baseWidget = widgets.find((w: any) => w.name === selectedValue.value);

			if (baseWidget) {
				badge = {
					color: 'blue',
					children: 'Widget',
				};
			} else {
				badge = {
					color: 'yellow',
					children: 'Modal',
				};
			}
		}

		return (
			<Stack alignItems="center" direction="row">
				<Icon boxSize="5" as={icon} flexShrink="0" />
				<Stack direction="row" flex="1" spacing="0">
					{selectedValue?.label ? (
						<Text fontWeight="medium" fontSize="sm">
							{selectedValue.label}
						</Text>
					) : null}
					<Code bg="transparent" ml={selectedValue?.label ? '1.5' : '0'}>
						{selectedValue?.value}{' '}
						<Text as="i" fontStyle="italic" fontSize="x-small">
							{selectedValue?.file}
						</Text>
					</Code>
				</Stack>
				{showBadge ? (
					<Badge
						size="xs"
						textTransform="capitalize"
						ml="1"
						colorScheme={badge.color}
						variant="subtle"
					>
						{badge.children}
					</Badge>
				) : null}
			</Stack>
		);
	};

	const optionRenderer = (option: any) => {
		const optionValue = `${option.type}-${option.value}`;

		return (
			<MenuItemOption fontSize="sm" key={optionValue} value={optionValue}>
				{optionValueRenderer({ option })}
			</MenuItemOption>
		);
	};

	const handleChooseWidget = (newWidgetName: any) => {
		setPageAtom((oldPageAtom) => ({
			...oldPageAtom,
			widgetName: newWidgetName,
		}));
	};

	const handleCreateWidget = async (widgetType: any) => {
		const { name: wName, label: wLabel } = generateSequentialName({
			currentNames: widgets?.map((w: any) => w.name) as string[],
			prefix: 'widget',
		});

		try {
			await createMutation.mutateAsync({
				app_name: appName,
				page_name: pageName,
				properties: {
					...(properties || {}),
					blocks: [
						...(properties?.blocks || []).map((w: any) => {
							if (w.type === 'widget' && w.name === widgetName) {
								return {
									...w,
									components: (w.components || []).map((c: any) => {
										if (c.name === componentId) {
											return {
												...c,
												on_click: {
													type: 'widget',
													value: wName,
												},
											};
										}

										return c;
									}),
								};
							}

							return w;
						}),
						{
							name: wName,
							label: wLabel,
							type: widgetType,
							menu_item: true,
							components: [],
						},
					],
				},
			});
			handleChooseWidget(wName);
			setInspectedResource({
				type: 'widget',
				id: wName,
				meta: null,
			});
		} catch (e) {
			//
		}
	};

	return (
		<FormControl>
			<FormLabel>{title || id}</FormLabel>

			<Controller
				control={control}
				name={id}
				render={({ field: { onChange, onBlur, value } }) => {
					const handleChange = (newValue: any) => {
						if (newValue === 'new_widget') {
							return;
						}

						const selectedOption = allOptions.find(
							(o: any) => `${o.type}-${o.value}` === newValue,
						);

						onSelect?.();

						onChange({
							type: selectedOption.type,
							value: selectedOption.value,
							file: selectedOption.file,
						});
					};

					const valueForMenu = value ? `${value.type}-${value.value}` : '';

					return (
						<Menu>
							<Stack spacing="1">
								<MenuButton
									as={Stack}
									disabled={isLoading}
									direction="row"
									alignItems="center"
									borderWidth="1px"
									p="1.5"
									borderRadius="sm"
									type="button"
									onBlur={onBlur}
								>
									<Stack w="full" spacing="0" alignItems="center" direction="row">
										<Box>
											{value ? (
												optionValueRenderer({
													option: value,
													showBadge: true,
												})
											) : (
												<Text fontSize="sm">No options present</Text>
											)}
										</Box>
										<Box ml="auto">
											<ChevronDown size="14" />
										</Box>
									</Stack>
								</MenuButton>
								{value ? (
									<Button
										onClick={() => {
											onChange(null);
										}}
										colorScheme="gray"
										alignSelf="start"
										size="sm"
										variant="link"
									>
										Clear
									</Button>
								) : null}
							</Stack>
							<Portal>
								<MenuList
									zIndex="popover"
									borderRadius="sm"
									shadow="sm"
									p="0"
									maxH="sm"
									minW="sm"
									overflowY="auto"
								>
									<MenuOptionGroup
										value={valueForMenu}
										title="Trigger Function"
										type="radio"
										onChange={handleChange}
									>
										{functionsToBeRendered.map((func: any) => {
											return optionRenderer(func);
										})}
									</MenuOptionGroup>

									{showFetchersOnly ? null : (
										<>
											<MenuDivider />

											<MenuOptionGroup
												value={valueForMenu}
												title="Reload Tables"
												onChange={handleChange}
												type="radio"
											>
												{allTables.map((table: any) => {
													return optionRenderer(table);
												})}
											</MenuOptionGroup>

											<MenuDivider />

											<MenuOptionGroup
												value={valueForMenu}
												title="Show Modal"
												onChange={handleChange}
												type="radio"
											>
												{modalWidgets.map((func: any) => {
													return optionRenderer(func);
												})}

												<MenuItem
													fontSize="md"
													value="new_widget"
													icon={<Plus size="14" />}
													onClick={() => {
														handleCreateWidget('modal');
													}}
												>
													Create modal Widget
												</MenuItem>
											</MenuOptionGroup>

											<MenuDivider />

											<MenuOptionGroup
												value={valueForMenu}
												title="Navigate to Widget"
												onChange={handleChange}
												type="radio"
											>
												{baseWidgets.map((func: any) => {
													return optionRenderer(func);
												})}

												<MenuItem
													fontSize="md"
													value="new_widget"
													icon={<Plus size="14" />}
													onClick={() => {
														handleCreateWidget('base');
													}}
												>
													Create base Widget
												</MenuItem>
											</MenuOptionGroup>
										</>
									)}
								</MenuList>
							</Portal>
						</Menu>
					);
				}}
			/>
		</FormControl>
	);
};
