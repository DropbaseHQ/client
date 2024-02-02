import { Box, Button, Code, Progress, Skeleton, Stack, Text } from '@chakra-ui/react';
import { ChevronDown } from 'react-feather';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useStatus } from '@/layout/StatusBar';

import { useGetWidgetPreview } from '@/features/app-preview/hooks';
import { useInitializeWidgetState } from '@/features/app-state';
import { pageAtom, useGetPage } from '@/features/page';
import { useCreateWidget, useReorderComponents } from '@/features/app-builder/hooks';
import { Loader } from '@/components/Loader';
import { InspectorContainer } from '@/features/app-builder';
import { appModeAtom } from '@/features/app/atoms';
import { generateSequentialName } from '@/utils';
import { NewWidget } from '@/features/app-preview/components/NewWidget';
import { WidgetSwitcher } from '@/features/app-preview/components/WidgetSwitcher';
import { WidgetPreview } from '@/features/app-preview/WidgetPreview';

export const AppPreview = () => {
	const { appName, pageName } = useParams();
	const { isConnected } = useStatus();
	const { widgetName, widgets, modals } = useAtomValue(pageAtom);

	const widgetLabel = widgets?.find((w) => w.name === widgetName)?.label;

	const { isPreview } = useAtomValue(appModeAtom);
	const isDevMode = !isPreview;

	const { isLoading, description: widgetDescription } = useGetWidgetPreview(widgetName || '');
	useInitializeWidgetState({ appName, pageName });

	const { properties } = useGetPage({ appName, pageName });
	const createMutation = useCreateWidget();

	const reorderMutation = useReorderComponents();

	const handleCreateWidget = () => {
		const { name: wName, label: wLabel } = generateSequentialName({
			currentNames: widgets?.map((w: any) => w.name) as string[],
			prefix: 'widget',
		});

		createMutation.mutate({
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
	};

	if (!widgetName) {
		if (!isDevMode) {
			return null;
		}

		return (
			<Stack p={6} bg="white" h="full">
				<Stack borderWidth="1px" borderRadius="sm" px={4} pt={4} pb={24} bg="gray.50">
					<Skeleton bg="gray.100" borderRadius="sm" h={8} speed={0} />
					<Box h={8} bg="white" borderWidth="1px" />
					<Stack
						direction="row"
						justifyContent="space-between"
						h={8}
						bg="white"
						p="2"
						alignItems="center"
						borderWidth="1px"
					>
						<Skeleton startColor="gray.100" flex="1" endColor="gray.100" h="full" />
						<ChevronDown size="14" />
					</Stack>

					<Box h={8} maxW="fit-content" p="2" bg="blue.500" borderWidth="1px">
						<Skeleton
							w="24"
							borderRadius="sm"
							h="full"
							startColor="gray.50"
							flex="1"
							endColor="gray.50"
						/>
					</Box>
				</Stack>
				<Stack mt="6">
					<Text fontWeight="medium" fontSize="md">
						Extend your Smart Table with Widgets and Functions
					</Text>
					<Button
						w="fit-content"
						colorScheme="blue"
						size="sm"
						isLoading={createMutation.isLoading}
						isDisabled={!isConnected}
						onClick={handleCreateWidget}
					>
						Build Widget
					</Button>
				</Stack>
			</Stack>
		);
	}

	const widgetsToDisplay = [widgetName, ...modals].filter(Boolean);

	return (
		<Loader isLoading={isLoading}>
			<Stack bg="white" h="full">
				{reorderMutation.isLoading && <Progress size="xs" isIndeterminate />}
				<Stack px="4" pt="4" pb="2" borderBottomWidth="1px" direction="row">
					<InspectorContainer flex="1" noPadding type="widget" id={widgetName}>
						<Stack spacing="0">
							<Stack direction="row" display="flex" alignItems="center">
								<Text fontSize="lg" fontWeight="semibold">
									{widgetLabel || widgetName}
								</Text>
								{!isPreview && (
									<Code fontSize="sm" bg="transparent" color="gray.600" ml="3">
										{widgetName}
									</Code>
								)}
							</Stack>

							{widgetDescription ? (
								<Text fontSize="sm" color="gray.600">
									{widgetDescription}
								</Text>
							) : null}
						</Stack>
					</InspectorContainer>

					<NewWidget />
					<WidgetSwitcher />
				</Stack>
				{widgetsToDisplay.map((wName: string) => (
					<WidgetPreview key={wName} widgetName={wName} />
				))}
			</Stack>
		</Loader>
	);
};
