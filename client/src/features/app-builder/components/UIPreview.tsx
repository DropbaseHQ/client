import {
	Alert,
	AlertDescription,
	AlertIcon,
	Box,
	Code,
	IconButton,
	Stack,
	Text,
} from '@chakra-ui/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { RefreshCw, X } from 'react-feather';
import { Panel, PanelGroup } from 'react-resizable-panels';
import { useParams } from 'react-router-dom';

import { PanelHandle } from '@/components/Panel';
import { useGetPage } from '@/features/app/hooks';
import { useGetUIJson } from '@/features/app/hooks/useGetUIJson';
import { runResultAtom, uiCodeAtom } from '../atoms/tableContextAtoms';
import { UIEditor } from './UIEditor';
import { InputRenderer } from '@/features/app-builder/components/InputRenderer';

export const UIPreview = () => {
	const [uiCode, setUICode] = useAtom(uiCodeAtom);
	const { pageId } = useParams();
	const { uiComponents } = useGetPage(pageId || '');

	const log = useAtomValue(runResultAtom);

	useEffect(() => {
		if (uiComponents?.[0]) {
			const code = uiComponents?.[0].code;
			if (code) {
				setUICode(code);
			}
		}
	}, [uiComponents, setUICode]);

	const {
		components,
		refetch,
		isFetching: isLoading,
	} = useGetUIJson({
		page_id: pageId || '',
		code: (uiCode || '').trim(),
	});

	const onRefreshUI = () => {
		refetch();
	};

	return (
		<Stack>
			<Box w="full" display="flex" justifyContent="space-between">
				UI Preview
				<IconButton
					aria-label="Refresh UI"
					size="xs"
					icon={<RefreshCw size="16" />}
					variant="outline"
					isLoading={isLoading}
					onClick={onRefreshUI}
				/>
			</Box>

			{components.map((c: any) => {
				return <InputRenderer key={c.name} {...c} />;
			})}

			{log ? (
				<Alert borderRadius="md" status={log.status}>
					<AlertIcon />
					<AlertDescription>{log.result}</AlertDescription>
				</Alert>
			) : null}
		</Stack>
	);
};

export const UIPanel = () => {
	const log = useAtomValue(runResultAtom);
	const setLog = useSetAtom(runResultAtom);
	const runResult = log
		? `Result:
${log.result}\n
Stdout:
${log.stdout}\n
Traceback:
${log.traceback}`
		: '';

	return (
		<PanelGroup direction="vertical">
			<Panel>
				<UIEditor />
			</Panel>
			{runResult ? <PanelHandle direction="horizontal" /> : null}

			{runResult ? (
				<Panel>
					<Stack h="full" pt="2" borderTopWidth="1px" pl="1rem">
						<Stack direction="row" alignItems="center">
							<IconButton
								aria-label="Close output"
								isRound
								size="xs"
								colorScheme="gray"
								icon={<X size={14} />}
								onClick={() => setLog(null)}
							/>

							<Text px="2" fontSize="xs" letterSpacing="wide" fontWeight="bold">
								Output
							</Text>
						</Stack>

						<Code
							color="gray.500"
							backgroundColor="inherit"
							paddingLeft="3rem"
							overflow="hidden"
							h="100%"
						>
							<pre>{runResult}</pre>
						</Code>
					</Stack>
				</Panel>
			) : null}
		</PanelGroup>
	);
};
