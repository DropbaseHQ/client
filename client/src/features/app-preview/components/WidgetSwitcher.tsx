import {
	Menu,
	IconButton,
	MenuButton,
	MenuList,
	MenuOptionGroup,
	MenuItemOption,
	Tooltip,
} from '@chakra-ui/react';

import { useAtomValue, useSetAtom } from 'jotai';
import { ChevronDown } from 'react-feather';
import { pageAtom } from '@/features/page';

export const WidgetSwitcher = () => {
	const { widgetName, widgets } = useAtomValue(pageAtom);
	const setPageAtom = useSetAtom(pageAtom);

	const handleChooseWidget = (newWidgetName: any) => {
		setPageAtom((oldPageAtom) => ({
			...oldPageAtom,
			widgetName: newWidgetName,
		}));
	};

	return (
		<Menu closeOnSelect={false}>
			<Tooltip label="Switch widget">
				<MenuButton
					icon={<ChevronDown size="14" />}
					as={IconButton}
					colorScheme="gray"
					variant="outline"
					size="xs"
				/>
			</Tooltip>
			<MenuList minWidth="240px">
				<MenuOptionGroup
					value={widgetName || ''}
					onChange={handleChooseWidget}
					title="Select widget"
					type="radio"
				>
					{widgets?.map((w: any) => (
						<MenuItemOption key={w?.name} value={w?.name}>
							{w?.name}
						</MenuItemOption>
					))}
				</MenuOptionGroup>
			</MenuList>
		</Menu>
	);
};
