import { IconButton, Tooltip } from '@chakra-ui/react';

import { Plus } from 'react-feather';
import { useParams } from 'react-router-dom';

import { useAtomValue, useSetAtom } from 'jotai';
import { useStatus } from '@/layout/StatusBar';
import { pageAtom, useGetPage } from '@/features/page';
import { useCreateWidget } from '@/features/app-builder/hooks';
import { appModeAtom } from '@/features/app/atoms';

import { generateSequentialName } from '@/utils';

export const NewWidget = (props: any) => {
	const { appName, pageName } = useParams();
	const { isConnected } = useStatus();
	const { widgets } = useAtomValue(pageAtom);

	const { isPreview } = useAtomValue(appModeAtom);

	const { properties } = useGetPage({ appName, pageName });
	const createMutation = useCreateWidget();

	const setPageAtom = useSetAtom(pageAtom);

	const handleChooseWidget = (newWidgetName: any) => {
		setPageAtom((oldPageAtom) => ({
			...oldPageAtom,
			widgetName: newWidgetName,
		}));
	};

	const handleCreateWidget = async () => {
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
					widgets: [
						...(properties?.widgets || []),
						{
							name: wName,
							label: wLabel,
							type: 'base',
							menu_item: true,
							components: [],
						},
					],
				},
			});
			handleChooseWidget(wName);
		} catch (e) {
			//
		}
	};

	if (isPreview) {
		return null;
	}

	return (
		<Tooltip label="Add Widget">
			<IconButton
				aria-label="Add Widget"
				icon={<Plus size="14" />}
				variant="outline"
				size="xs"
				colorScheme="gray"
				isLoading={createMutation.isLoading}
				onClick={handleCreateWidget}
				isDisabled={!isConnected}
				{...props}
			/>
		</Tooltip>
	);
};
