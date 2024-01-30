import {
	Box,
	Menu,
	IconButton,
	MenuButton,
	MenuList,
	MenuOptionGroup,
	MenuItemOption,
	Tooltip,
	Text,
	Code,
} from '@chakra-ui/react';

import { useAtomValue, useSetAtom } from 'jotai';
import { ChevronDown } from 'react-feather';
import { pageAtom } from '@/features/page';
import { allWidgetsInputAtom } from '@/features/app-state';
import { appModeAtom } from '@/features/app/atoms';

export const WidgetSwitcher = () => {
	const { widgetName, widgets } = useAtomValue(pageAtom);
	const { isPreview } = useAtomValue(appModeAtom);
	const setPageAtom = useSetAtom(pageAtom);
	const widgetsInput = useAtomValue(allWidgetsInputAtom);
	const setWidgetsInputAtom = useSetAtom(allWidgetsInputAtom);

	const resetWidgetInputs = (targetWidgetName: string) => {
		const targetWidgetState: { [key: string]: any } | undefined =
			widgetsInput?.[targetWidgetName as keyof typeof widgetsInput];

		const newWidgetState: { [key: string]: any } = {};
		Object.keys(targetWidgetState || {}).forEach((key) => {
			newWidgetState[key] = null;
		});
		setWidgetsInputAtom((oldWidgetsInputAtom: any) => {
			return {
				...oldWidgetsInputAtom,
				[targetWidgetName || '']: newWidgetState,
			};
		});
	};

	const handleChooseWidget = (newWidgetName: any) => {
		setPageAtom((oldPageAtom) => ({
			...oldPageAtom,
			widgetName: newWidgetName,
		}));
		resetWidgetInputs(newWidgetName);
	};

	return (
		<Menu placement="bottom-end" closeOnSelect>
			<Tooltip label="Switch widget">
				<MenuButton
					icon={<ChevronDown size="14" />}
					as={IconButton}
					colorScheme="gray"
					variant="outline"
					ml="auto"
					size="xs"
				/>
			</Tooltip>
			<MenuList minWidth="xs">
				<MenuOptionGroup
					value={widgetName || ''}
					onChange={handleChooseWidget}
					title="Select widget"
					type="radio"
				>
					{widgets?.map((w: any) => (
						<MenuItemOption key={w?.name} value={w?.name}>
							<Box display="flex" alignItems="end">
								<Text fontSize="md">{w.label}</Text>
								{!isPreview && (
									<Code fontSize="sm" bg="transparent" color="gray.600" ml="auto">
										{w.name}
									</Code>
								)}
							</Box>
						</MenuItemOption>
					))}
				</MenuOptionGroup>
			</MenuList>
		</Menu>
	);
};
