import { Progress, Stack } from '@chakra-ui/react';

import { useParams } from 'react-router-dom';

import { useGetPage, useUpdatePageData } from '@/features/page';
import { useGetTable, useReorderComponents } from '@/features/app-builder/hooks';
import { InspectorContainer } from '@/features/app-builder';

import { ComponentsList } from '@/features/app-preview/ComponentsList';
import { AppComponent } from '@/features/app-preview/AppComponent';

export const ComponentsPreview = ({ type, tableName }: any) => {
	const { appName, pageName } = useParams();

	const { [type]: components } = useGetTable(tableName);

	const updateMutation = useUpdatePageData();

	const { properties } = useGetPage({ appName, pageName });

	const reorderMutation = useReorderComponents();

	const handleReorderComponents = (newCompState: any[]) => {
		const currentTable = properties[tableName] || {};

		updateMutation.mutate({
			app_name: appName,
			page_name: pageName,
			properties: {
				...(properties || {}),
				[tableName]: {
					...currentTable,
					[type]: newCompState,
				},
			},
		});
	};

	const borderStyles: any = {
		header: {
			borderBottom: 0,
			borderTopLeftRadius: 'md',
			borderTopRightRadius: 'md',
		},
		footer: {
			borderTop: 0,
			borderBottomLeftRadius: 'md',
			borderBottomRightRadius: 'md',
		},
	};

	return (
		<Stack borderWidth="1px" {...borderStyles[type]} px="3" py="2" h="full" bg="white">
			<ComponentsList
				renderNewComponent={() => {
					return (
						<Stack mt="2">
							{/* <NewComponent widgetName={widgetName} w="full" variant="secondary" />
							<MirrorTableColumns widgetName={widgetName} /> */}
						</Stack>
					);
				}}
				reorderComponents={handleReorderComponents}
				components={components}
				id={`${tableName}-${type}`}
				inline
			>
				{({ containerProps, component, sendJsonMessage }: any) => (
					<InspectorContainer
						key={component.name}
						id={component.name}
						type="table-component"
						data-cy={`component-${component.name}-inspector`}
						meta={{ table: tableName, resource: type }}
						{...containerProps}
					>
						<AppComponent
							key={component.name}
							resource={type}
							tableName={tableName}
							sendJsonMessage={sendJsonMessage}
							{...component}
						/>
					</InspectorContainer>
				)}
			</ComponentsList>

			{reorderMutation.isLoading && <Progress mt="auto" size="xs" isIndeterminate />}
		</Stack>
	);
};
