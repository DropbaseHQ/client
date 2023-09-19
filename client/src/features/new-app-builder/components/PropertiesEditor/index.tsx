import { useParams } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import { Box, Button, ButtonGroup, Center, Skeleton, Stack, Text } from '@chakra-ui/react';
import { Code, Layout, Table } from 'react-feather';

import { FunctionEditor } from './FunctionEditor';
import { TableConfig } from './TableConfig';
import { WidgetConfig } from './WidgetConfig';
import { NewFunction } from './Functions';
import { pageAtom, useGetPage } from '@/features/new-page';
import { developerTabAtom } from '@/features/new-app-builder/atoms';

const componentsMap: any = {
	table: TableConfig,
	widget: WidgetConfig,
	function: FunctionEditor,
};

export const PropertiesEditor = () => {
	const { pageId } = useParams();
	const { functions, tables, widget, isLoading } = useGetPage(pageId || '');

	const { widgetId } = useAtomValue(pageAtom);
	const [devTab, setDevTab] = useAtom(developerTabAtom);

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
				{tables.length > 0 ? (
					<ButtonGroup isAttached size="sm">
						{tables.map((t: any) => (
							<Button
								variant={
									devTab.type === 'table' && t.id === devTab.id
										? 'solid'
										: 'outline'
								}
								onClick={() => {
									setDevTab({
										type: 'table',
										id: t.id,
									});
								}}
								leftIcon={<Table size="14" />}
								key={t.id}
							>
								{t.name}
							</Button>
						))}
					</ButtonGroup>
				) : null}

				{widget ? (
					<Button
						isDisabled={!widgetId}
						size="sm"
						variant={
							devTab.type === 'widget' && widget.id === devTab.id
								? 'solid'
								: 'outline'
						}
						onClick={() => {
							setDevTab({
								type: 'widget',
								id: widget.id,
							});
						}}
						leftIcon={<Layout size="14" />}
					>
						{widget.name}
					</Button>
				) : null}

				{functions.length > 0 ? (
					<ButtonGroup isAttached size="sm">
						{functions.map((f: any) => (
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
				) : null}
			</Stack>

			<Box h="calc(100% - 55px)" overflowX="hidden" overflowY="auto">
				{Component ? (
					<Component id={devTab.type === 'function' ? devTab.id : ''} />
				) : (
					<Center p="4" h="full">
						<Text size="sm" fontWeight="medium">
							Select a tab
						</Text>
					</Center>
				)}
			</Box>
		</Stack>
	);
};
