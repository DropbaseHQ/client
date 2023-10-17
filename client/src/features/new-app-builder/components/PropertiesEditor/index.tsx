import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Box, Button, ButtonGroup, Center, Skeleton, Stack, Text } from '@chakra-ui/react';
import { Code } from 'react-feather';

import { developerTabAtom } from '@/features/new-app-builder/atoms';

import { FunctionEditor } from './FunctionEditor';
import { TableConfig } from './TableConfig';
import { WidgetConfig } from './WidgetConfig';
import { NewFunction } from './Functions';
import { useMonacoLoader } from '@/components/Editor';
import { usePageFunctions } from '@/features/new-app-builder/hooks';

const componentsMap: any = {
	table: TableConfig,
	widget: WidgetConfig,
	function: FunctionEditor,
};

export const PropertiesEditor = () => {
	const { functions, isLoading } = usePageFunctions({
		appName: 'app',
		pageName: 'page1',
	});

	const isReady = useMonacoLoader();

	const [devTab, setDevTab] = useAtom(developerTabAtom);

	useEffect(() => {
		return () => {
			setDevTab({
				type: null,
				id: null,
			});
		};
	}, [setDevTab]);

	if (!isReady || isLoading) {
		return <Skeleton />;
	}

	const Component = componentsMap[devTab.type];

	return (
		<Stack spacing="0" h="full">
			<Stack
				p="2"
				position="sticky"
				top="0"
				spacing="4"
				borderBottomWidth="1px"
				bg="white"
				h="55px"
				alignItems="center"
				direction="row"
			>
				<ButtonGroup isAttached size="sm">
					{(functions || []).map((f: any) => (
						<Button
							variant={
								devTab.type === 'function' && f === devTab.id ? 'solid' : 'outline'
							}
							onClick={() => {
								setDevTab({
									type: 'function',
									id: f,
								});
							}}
							leftIcon={<Code size="14" />}
							key={f}
						>
							{f.split('/').pop()}
						</Button>
					))}
					<NewFunction variant="outline" />
				</ButtonGroup>
			</Stack>

			<Box h="calc(100% - 55px)" overflowX="hidden" overflowY="auto">
				{Component ? (
					<Component id={devTab.type === 'function' ? devTab.id : ''} />
				) : (
					<Center p="4" h="full">
						<Text size="sm" fontWeight="medium">
							{functions.length > 0 ? 'Select a function' : 'Create a function'}
						</Text>
					</Center>
				)}
			</Box>
		</Stack>
	);
};
