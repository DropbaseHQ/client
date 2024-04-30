import { useSetAtom } from 'jotai';
import { Stack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { useParams } from 'react-router-dom';

import { PanelHandle } from '@/components/Panel';
import { AppPreview } from '@/features/app-preview';
import { StackedTables } from '@/features/smart-table';
import { Loader } from '@/components/Loader';

import { AppNavbar } from './AppNavbar';
import { appModeAtom } from '@/features/app/atoms';
import { useInitializePageState } from '@/features/app-state';

export const App = () => {
	const updateMode = useSetAtom(appModeAtom);
	const { appName, pageName } = useParams();

	const { isLoading: isLoadingState } = useInitializePageState(appName || '', pageName || '');

	const isLoading = isLoadingState;

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
				<Panel defaultSize={80} minSize={10}>
					<Loader isLoading={isLoading}>
						<StackedTables />
					</Loader>
				</Panel>
				<PanelHandle direction="vertical" />
				<Panel minSize={10}>
					<Loader isLoading={isLoading}>
						<AppPreview />
					</Loader>
				</Panel>
			</PanelGroup>
		</Stack>
	);
};
