import { useSetAtom } from 'jotai';
import { Stack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { useInitPage } from '@/features/new-page';
import { PanelHandle } from '@/components/Panel';
import { NewAppPreview } from '@/features/new-app-preview';
import { StackedTables } from '@/features/new-smart-table';
import { Loader } from '@/components/Loader';

import { AppNavbar } from './AppNavbar';
import { appModeAtom } from '@/features/app/atoms';

export const NewApp = () => {
	const updateMode = useSetAtom(appModeAtom);
	const { isLoading } = useInitPage();

	useEffect(() => {
		updateMode({
			isPreview: true,
		});

		return () => {
			updateMode({
				isPreview: false,
			});
		};
	}, [updateMode]);

	return (
		<Stack spacing="0" h="full">
			<AppNavbar isPreview />
			<PanelGroup direction="horizontal">
				<Panel defaultSize={80}>
					<Loader isLoading={isLoading}>
						<StackedTables />
					</Loader>
				</Panel>
				<PanelHandle direction="vertical" />
				<Panel>
					<Loader isLoading={isLoading}>
						<NewAppPreview />
					</Loader>
				</Panel>
			</PanelGroup>
		</Stack>
	);
};
