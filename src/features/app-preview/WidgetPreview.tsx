import { Box, CloseButton, Stack } from '@chakra-ui/react';

import { Move } from 'react-feather';
import { useParams } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';

import { useGetWidgetPreview } from '@/features/app-preview/hooks';
import { pageContextAtom, pageStateContextAtom } from '@/features/app-state';
import { useGetPage, useUpdatePageData } from '@/features/page';
import { Loader } from '@/components/Loader';
import { InspectorContainer } from '@/features/app-builder';
import { AppComponent } from './AppComponent';
import { Notification } from '@/features/app-preview/components/Notification';
import { ComponentsList } from '@/features/app-preview/ComponentsList';
import { NewComponent } from '@/features/app-builder/components/PropertiesEditor/NewComponent';
import { LabelContainer } from '@/components/LabelContainer';
import { appModeAtom } from '@/features/app/atoms';
import { extractTemplateString } from '@/utils';

export const WidgetPreview = ({ widgetName }: any) => {
	const { appName, pageName } = useParams();

	const { widgets } = useGetPage({
		appName,
		pageName,
	});

	const { properties } = useGetPage({ appName, pageName });

	const { isPreview } = useAtomValue(appModeAtom);

	const widget = widgets?.find((w: any) => w.name === widgetName);
	const isModal = widget?.type === 'modal';

	const { isLoading, components } = useGetWidgetPreview(widgetName || '');
	const updateMutation = useUpdatePageData();

	const pageStateContext = useAtomValue(pageStateContextAtom);

	const [allWidgetContext, setWidgetContext]: any = useAtom(pageContextAtom);

	const widgetContext: any = allWidgetContext[widgetName || ''];

	const handleRemoveAlert = () => {
		setWidgetContext(
			{
				...(allWidgetContext || {}),
				[widgetName]: {
					...(allWidgetContext?.[widgetName] || {}),
					message: null,
					message_type: null,
				},
			},
			{
				replace: true,
			},
		);
	};

	const handleReorderComponents = (newCompState: any[]) => {
		const currentWidget = properties[widgetName] || {};

		updateMutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: {
				...(properties || {}),
				[widgetName]: {
					...currentWidget,
					components: newCompState,
				},
			},
		});
	};

	const disableModal = () => {
		setWidgetContext({
			...allWidgetContext,
			[widgetName]: {
				...(allWidgetContext?.[widgetName] || {}),
				visible: false,
			},
		});
	};

	const modals: any = widgets?.filter((w: any) => w.type === 'modal');
	const modalIndex = isModal ? modals.findIndex((m: any) => m.name === widgetName) : -1;

	const showModalStyles = isModal && modals.map((m: any) => m.name).includes(widgetName);

	const containerStyles = showModalStyles
		? {
				width: 'calc(100% - 20px)',
				mx: 'auto',
				height: 'calc(100% - 20px)',
				shadow: 'xl',
				borderRadius: 'md',
				borderWidth: '1px',

				pt: 3,
				top: '10px',
				left: '10px',
				zIndex: 3 + modalIndex,
		  }
		: {
				h: 'full',
		  };

	return (
		<Loader isLoading={isLoading}>
			{showModalStyles ? (
				<Box
					w="full"
					h="full"
					position="fixed"
					bg="blackAlpha.100"
					top="0"
					left="0"
					zIndex={2}
					onClick={disableModal}
				/>
			) : null}
			<Stack
				position={showModalStyles ? 'absolute' : 'initial'}
				{...containerStyles}
				bg="white"
			>
				<LabelContainer>
					{isPreview ? null : (
						<Box
							_hover={{
								color: 'gray.800',
								borderColor: 'gray.50',
							}}
							borderWidth="1px"
							borderColor="transparent"
							borderRadius="sm"
							cursor="grab"
							className="react-grid-drag-handle"
						>
							<Move size="14" />
						</Box>
					)}
					<Stack direction="row">
						<Stack spacing="0">
							<LabelContainer.Label>
								{extractTemplateString(
									widget.label || widgetName,
									pageStateContext,
								)}
							</LabelContainer.Label>

							{isPreview ? null : (
								<LabelContainer.Code>{widgetName}</LabelContainer.Code>
							)}
						</Stack>
					</Stack>
				</LabelContainer>

				{showModalStyles ? (
					<CloseButton
						bg="white"
						borderWidth="1px"
						position="absolute"
						top="-3"
						right="-3"
						size="xs"
						onClick={disableModal}
					/>
				) : null}

				<ComponentsList
					renderNewComponent={() => {
						return (
							<Stack mt="2">
								<NewComponent
									widgetName={widgetName}
									w="full"
									resource="widget"
									variant="secondary"
								/>
							</Stack>
						);
					}}
					reorderComponents={handleReorderComponents}
					components={components}
					id={widgetName}
				>
					{({ containerProps, component, sendJsonMessage, inline }: any) => (
						<InspectorContainer
							key={component.name}
							id={component.name}
							type="widget-component"
							data-cy={`component-${component.name}-inspector`}
							meta={{ widget: widgetName, resource: 'widget' }}
							{...containerProps}
							top={inline ? 'auto !important' : undefined}
						>
							<AppComponent
								key={component.name}
								resource="widget"
								widgetName={widgetName}
								sendJsonMessage={sendJsonMessage}
								{...component}
							/>
						</InspectorContainer>
					)}
				</ComponentsList>

				<Notification
					message={widgetContext?.message}
					type={widgetContext?.message_type}
					onClose={handleRemoveAlert}
				/>
			</Stack>
		</Loader>
	);
};
