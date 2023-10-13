import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Box, Button, ButtonGroup, Center, Skeleton, Stack, Text } from '@chakra-ui/react';
import { Code } from 'react-feather';

import { useGetPage } from '@/features/new-page';
import { developerTabAtom } from '@/features/new-app-builder/atoms';

import { FunctionEditor } from './FunctionEditor';
import { TableConfig } from './TableConfig';
import { WidgetConfig } from './WidgetConfig';
import { NewFunction } from './Functions';

const componentsMap: any = {
	table: TableConfig,
	widget: WidgetConfig,
	function: FunctionEditor,
};

export const PropertiesEditor = () => {
	const { pageId } = useParams();
	const { functions, isLoading } = useGetPage(pageId || '');

	const [devTab, setDevTab] = useAtom(developerTabAtom);

	useEffect(() => {
		return () => {
			setDevTab({
				type: null,
				id: null,
			});
		};
	}, [setDevTab]);

	if (isLoading) {
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
								devTab.type === 'function' && f.id === devTab.id
									? 'solid'
									: 'outline'
							}
							onClick={() => {
								setDevTab({
									type: 'function',
									id: f.id,
								});
							}}
							leftIcon={<Code size="14" />}
							key={f.id}
						>
							{f.name}
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
							{functions.length > 0 ? 'Selec a function' : 'Create a function'}
						</Text>
					</Center>
				)}
			</Box>
		</Stack>
	);
};
