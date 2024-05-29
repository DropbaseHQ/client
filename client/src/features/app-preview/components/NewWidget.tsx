import { Button } from '@chakra-ui/react';

import { Plus } from 'react-feather';
import { useParams } from 'react-router-dom';

import { useAtomValue } from 'jotai';
import { useStatus } from '@/layout/StatusBar';
import { useGetPage } from '@/features/page';
import { useCreateWidget } from '@/features/app-builder/hooks';
import { appModeAtom } from '@/features/app/atoms';

import { generateSequentialName } from '@/utils';

export const NewWidget = (props: any) => {
	const { appName, pageName } = useParams();
	const { isConnected } = useStatus();
	const { widgets, allBlocks } = useGetPage({ appName, pageName });

	const { isPreview } = useAtomValue(appModeAtom);

	const { properties } = useGetPage({ appName, pageName });
	const createMutation = useCreateWidget();

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
					[wName]: {
						name: wName,
						label: wLabel,
						type: 'base',
						block_type: 'widget',
						menu_item: true,
						components: [],
						w: 1,
						y: Math.max(...allBlocks.map((t: any) => t.y)),
						x: Math.max(...allBlocks.map((t: any) => t.x)),
					},
				},
			});
		} catch (e) {
			//
		}
	};

	if (isPreview) {
		return null;
	}

	return (
		<Button
			aria-label="Add Widget"
			leftIcon={<Plus size="14" />}
			isLoading={createMutation.isLoading}
			onClick={handleCreateWidget}
			isDisabled={!isConnected}
			{...props}
		>
			New Widget
		</Button>
	);
};
