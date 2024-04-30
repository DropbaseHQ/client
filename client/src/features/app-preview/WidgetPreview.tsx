import { Box, CloseButton, Progress, Stack } from '@chakra-ui/react';

import { useParams } from 'react-router-dom';
import { useAtom } from 'jotai';

import { useGetWidgetPreview } from '@/features/app-preview/hooks';
import { pageContextAtom } from '@/features/app-state';
import { useGetPage, useUpdatePageData } from '@/features/page';
import { useReorderComponents } from '@/features/app-builder/hooks';
import { Loader } from '@/components/Loader';
import { InspectorContainer } from '@/features/app-builder';
import { AppComponent } from './AppComponent';
import { Notification } from '@/features/app-preview/components/Notification';
import { MirrorTableColumns } from '@/features/app-builder/components/PropertiesEditor/MirrorTableColumnInputs';
import { ComponentsList } from '@/features/app-preview/ComponentsList';
import { NewComponent } from '@/features/app-builder/components/PropertiesEditor/NewComponent';

export const WidgetPreview = ({ widgetName }: any) => {
	const { appName, pageName } = useParams();

	const { widgets } = useGetPage({
		appName,
		pageName,
	});

	const widget = widgets?.find((w: any) => w.name === widgetName);

	const isModal = widget?.type === 'modal';

	const { isLoading, components } = useGetWidgetPreview(widgetName || '');

	const updateMutation = useUpdatePageData();

	const [allWidgetContext, setWidgetContext]: any = useAtom(pageContextAtom);

	const { properties } = useGetPage({ appName, pageName });

	const reorderMutation = useReorderComponents();

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
		// setPageContext((oldPage: any) => {
		// 	const currentModal = oldPage.modals.find((m: any) => m.name === widgetName);
		// 	return {
		// 		...oldPage,
		// 		widgetName: currentModal.caller,
		// 		modals: oldPage.modals.filter((m: any) => m.name !== widgetName),
		// 	};
		// });
	};

	const modals: any = [];
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
								<MirrorTableColumns widgetName={widgetName} />
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

				{reorderMutation.isLoading && <Progress mt="auto" size="xs" isIndeterminate />}
			</Stack>
		</Loader>
	);
};
