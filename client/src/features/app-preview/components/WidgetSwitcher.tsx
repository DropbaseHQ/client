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

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { ChevronDown } from 'react-feather';

import { appModeAtom } from '@/features/app/atoms';
import { inspectedResourceAtom } from '@/features/app-builder/atoms';
import { pageContextAtom } from '@/features/app-state';
import { useGetPage } from '@/features/page';

export const WidgetSwitcher = () => {
	const [context, setPageContext] = useAtom(pageContextAtom);
	const { appName, pageName } = useParams();

	const { widgets } = useGetPage({
		appName,
		pageName,
	});
	const { isPreview } = useAtomValue(appModeAtom);

	const widgetName = widgets?.find((w: any) => (context as any)?.[w.name]?.visible)?.name;

	const updateSelectedWidget = useSetAtom(inspectedResourceAtom);

	const [previewWidth, setPreviewWidth] = useState<any>(250);

	useEffect(() => {
		const width = document.getElementById('preview-container')?.getBoundingClientRect()?.width;

		if (width && !Number.isNaN(width)) {
			setPreviewWidth(Math.min(width - 20, 300));
		}
	}, [isPreview]);

	const handleChooseWidget = (newWidgetName: any) => {
		const widgetsContext = widgets?.reduce(
			(agg: any, w: any) => ({
				...agg,
				[w?.name]: {
					...((context as any)?.[w?.name] || {}),
					visible: newWidgetName === w?.name,
				},
			}),
			{},
		);

		setPageContext(
			{
				...context,
				...widgetsContext,
			},
			{
				replace: true,
			},
		);

		updateSelectedWidget({
			type: 'widget',
			id: newWidgetName,
			meta: null,
		});
	};

	const widgetsToDisplay =
		widgets?.filter((w: any) => (isPreview ? w.type === 'base' && w.in_menu : true)) || [];

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
			<MenuList minW={previewWidth}>
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
										{w.type !== 'base' ? (
											<Tag size="sm" colorScheme="yellow">
												<Code bg="transparent" textTransform="capitalize">
													{w.type}
												</Code>
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
