import { Stack } from '@chakra-ui/react';

import { useAtomValue } from 'jotai';
import { useParams } from 'react-router-dom';

import { useGetPage, useUpdatePageData } from '@/features/page';
import { useGetTable } from '@/features/app-builder/hooks';
import { InspectorContainer } from '@/features/app-builder';

import { ComponentsList } from '@/features/app-preview/ComponentsList';
import { AppComponent } from '@/features/app-preview/AppComponent';
import { NewComponent } from '@/features/app-builder/components/PropertiesEditor/NewComponent';
import { appModeAtom } from '@/features/app/atoms';

export const ComponentsPreview = ({ type, tableName }: any) => {
	const { appName, pageName } = useParams();

	const { isPreview } = useAtomValue(appModeAtom);

	const { [type]: components } = useGetTable(tableName);

	const updateMutation = useUpdatePageData();

	const { properties } = useGetPage({ appName, pageName });

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

	if (isPreview && components.length === 0) {
		return null;
	}

	return (
		<Stack borderWidth="1px" {...borderStyles[type]} px="3" py="2" h="full" bg="white">
			<ComponentsList
				renderNewComponent={() => {
					return (
						<NewComponent
							tableName={tableName}
							resource={type}
							w="fit-content"
							ml="auto"
							variant="secondary"
							placement="right"
						/>
					);
				}}
				reorderComponents={handleReorderComponents}
				components={components}
				id={`${tableName}-${type}`}
				inline
			>
				{({ containerProps, component, sendJsonMessage, inline }: any) => (
					<InspectorContainer
						key={component.name}
						id={component.name}
						type={`${type}-component`}
						data-cy={`component-${component.name}-inspector`}
						meta={{ table: tableName, resource: type }}
						{...containerProps}
						top={inline ? 'auto !important' : undefined}
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
		</Stack>
	);
};
