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
	Stack,
	Tag,
} from '@chakra-ui/react';

import { useAtomValue, useSetAtom } from 'jotai';
import { ChevronDown } from 'react-feather';
import { pageAtom } from '@/features/page';

import { appModeAtom } from '@/features/app/atoms';
import { inspectedResourceAtom } from '@/features/app-builder/atoms';

export const WidgetSwitcher = () => {
	const { widgetName, widgets } = useAtomValue(pageAtom);
	const { isPreview } = useAtomValue(appModeAtom);
	const setPageAtom = useSetAtom(pageAtom);

	const updateSelectedWidget = useSetAtom(inspectedResourceAtom);

	const handleChooseWidget = (newWidgetName: any) => {
		setPageAtom((oldPageAtom) => ({
			...oldPageAtom,
			widgetName: newWidgetName,
		}));
		updateSelectedWidget({
			type: 'widget',
			id: newWidgetName,
		});
	};

	const widgetsToDisplay =
		widgets?.filter((w: any) => (isPreview ? w.type !== 'modal' && w.in_menu : true)) || [];

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
			<MenuList minWidth="sm">
				<MenuOptionGroup
					value={widgetName || ''}
					onChange={handleChooseWidget}
					title="Select widget"
					type="radio"
				>
					{widgetsToDisplay?.length > 0 ? (
						widgetsToDisplay?.map((w: any) => (
							<MenuItemOption key={w?.name} value={w?.name}>
								<Box display="flex" alignItems="end">
									<Stack direction="row">
										<Text fontSize="md">{w.label}</Text>
										{w.type === 'modal' ? (
											<Tag size="sm" colorScheme="yellow">
												<Code bg="transparent">Modal</Code>
											</Tag>
										) : null}
									</Stack>
									{!isPreview && (
										<Code
											fontSize="sm"
											bg="transparent"
											color="gray.600"
											ml="auto"
										>
											{w.name}
										</Code>
									)}
								</Box>
							</MenuItemOption>
						))
					) : (
						<Text py="0.5" px="4" fontSize="md">
							No widgets present
						</Text>
					)}
				</MenuOptionGroup>
			</MenuList>
		</Menu>
	);
};
