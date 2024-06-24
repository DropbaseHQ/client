import { useAtom } from 'jotai';
import { Box, Skeleton, Stack } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { Panel, PanelGroup } from 'react-resizable-panels';

import { useMonacoLoader } from '@/components/Editor';

import { developerTabAtom } from '@/features/app-builder/atoms';

import { FunctionEditor } from './FunctionEditor';
import { CodeEditor } from './CodeEditor';
import { useGetPage } from '@/features/page';
import { PanelHandle } from '@/components/Panel';
import { FunctionLogs } from './FunctionLogs';

const componentsMap: any = {
	python: FunctionEditor,
	json: CodeEditor,
};

export const FileContent = () => {
	const { appName, pageName } = useParams();
	const { isLoading } = useGetPage({ appName, pageName });

	const isReady = useMonacoLoader();

	const [devTab] = useAtom(developerTabAtom);

	if (!isReady || isLoading) {
		return (
			<Stack borderBottomWidth="1px" bg="white" p="2">
				<Stack direction="row">
					<Skeleton h="7" w="32" />
					<Skeleton h="7" w="32" />
					<Skeleton h="7" w="32" />
				</Stack>
			</Stack>
		);
	}

	const Component = componentsMap[devTab.type];

	return (
		<PanelGroup autoSaveId="dev-content" direction="vertical">
			<Panel>
				<Box h="full" overflowX="hidden" overflowY="auto">
					<Component name={devTab.id} />
				</Box>
			</Panel>
			<PanelHandle direction="horizontal" />
			<Panel defaultSize={11} maxSize={75} minSize={10}>
				<PanelGroup autoSaveId="test-content" direction="vertical">
					<PanelHandle direction="horizontal" />
					<Panel minSize={15}>
						<FunctionLogs />
					</Panel>
				</PanelGroup>
			</Panel>
		</PanelGroup>
	);
};
