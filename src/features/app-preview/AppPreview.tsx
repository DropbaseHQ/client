import { Box, Button, Skeleton, Stack, Text } from '@chakra-ui/react';
import { ChevronDown } from 'react-feather';
import { useParams } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';

import { useStatus } from '@/layout/StatusBar';

import { useGetWidgetPreview } from '@/features/app-preview/hooks';
import { pageContextAtom, pageStateContextAtom } from '@/features/app-state';
import { useGetPage } from '@/features/page';
import { useCreateWidget } from '@/features/app-builder/hooks';
import { Loader } from '@/components/Loader';
import { InspectorContainer } from '@/features/app-builder';
import { appModeAtom } from '@/features/app/atoms';
import { extractTemplateString, generateSequentialName } from '@/utils';
import { NewWidget } from '@/features/app-preview/components/NewWidget';
import { WidgetPreview } from '@/features/app-preview/WidgetPreview';
import { LabelContainer } from '@/components/LabelContainer';
import { Notification } from '@/features/app-preview/components/Notification';

export const AppPreview = () => {
	const { appName, pageName } = useParams();
	const { isConnected } = useStatus();
	const { widgets } = useGetPage({
		appName,
		pageName,
	});

	const pageStateContext = useAtomValue(pageStateContextAtom);

	const [allBlocksContext, setPageContext] = useAtom(pageContextAtom);
	const pageContext = (allBlocksContext as any)?.page;

	const visibleWidget =
		widgets?.find((w: any) => (allBlocksContext as any)?.[w.name]?.visible)?.name || null;

	const widgetLabel = widgets?.find((w: any) => w.name === visibleWidget)?.label;

	const { isPreview } = useAtomValue(appModeAtom);
	const isDevMode = !isPreview;

	const { isLoading, description: widgetDescription } = useGetWidgetPreview(visibleWidget || '');

	const { properties } = useGetPage({ appName, pageName });
	const createMutation = useCreateWidget();

	const handleRemoveAlert = () => {
		setPageContext(
			{
				...allBlocksContext,
				page: {
					...(pageContext?.page || {}),
					message: null,
					message_type: null,
				},
			},
			{
				replace: true,
			},
		);
	};

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
				[wName]: {
					name: wName,
					label: wLabel,
					type: 'base',
					block_type: 'widget',
					menu_item: true,
					components: [],
				},
			},
		});
	};

	if (!visibleWidget && widgets?.length === 0) {
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
						data-cy="build-widget"
						isLoading={createMutation.isLoading}
						isDisabled={!isConnected}
						onClick={handleCreateWidget}
					>
						Build Widget
					</Button>
					<Notification
						message={pageContext?.message}
						type={pageContext?.message_type}
						onClose={handleRemoveAlert}
					/>
				</Stack>
			</Stack>
		);
	}

	const widgetsToDisplay = widgets
		.filter((w: any) => (allBlocksContext as any)?.[w?.name]?.visible)
		.map((w: any) => w.name);

	return (
		<Loader isLoading={isLoading}>
			<Stack id="preview-container" position="relative" bg="white" h="full">
				<Stack
					alignItems="center"
					px="4"
					pt="2"
					pb="3"
					borderBottomWidth="1px"
					direction="row"
				>
					<InspectorContainer flex="1" type="widget" id={visibleWidget}>
						<Stack overflow="hidden" spacing="0">
							<Stack direction="row" display="flex" alignItems="center">
								<LabelContainer>
									<LabelContainer.Label
										textOverflow="ellipsis"
										overflow="hidden"
										whiteSpace="nowrap"
									>
										{/* TODO: create a render template data to do this */}
										{extractTemplateString(
											widgetLabel || visibleWidget,
											pageStateContext,
										)}
									</LabelContainer.Label>
									{!isPreview && (
										<LabelContainer.Code>{visibleWidget}</LabelContainer.Code>
									)}
								</LabelContainer>
							</Stack>

							{widgetDescription ? (
								<Text fontSize="sm" color="gray.600">
									{extractTemplateString(widgetDescription, pageStateContext)}
								</Text>
							) : null}
						</Stack>
					</InspectorContainer>

					<NewWidget />
				</Stack>
				<Stack overflowX="hidden" h="full">
					{widgetsToDisplay.map((wName: string) => (
						<WidgetPreview key={wName} widgetName={wName} />
					))}

					<Notification
						message={pageContext?.message}
						type={pageContext?.message_type}
						onClose={handleRemoveAlert}
					/>
				</Stack>
			</Stack>
		</Loader>
	);
};
