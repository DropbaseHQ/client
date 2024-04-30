import { useAtomValue, useSetAtom } from 'jotai';
import { Plus } from 'react-feather';
import { Box, Button, Menu, MenuButton, MenuItem, MenuList, Stack } from '@chakra-ui/react';

import { inspectedResourceAtom } from '@/features/app-builder/atoms';
import { pageAtom, useGetPage, useUpdatePageData } from '@/features/page';
import { useStatus } from '@/layout/StatusBar';
import { useToast } from '@/lib/chakra-ui';
import { generateSequentialName, getErrorMessage } from '@/utils';

export const NewComponent = ({ resource, widgetName, tableName, children, ...props }: any) => {
	const toast = useToast();
	const { isConnected } = useStatus();
	const { appName, pageName } = useAtomValue(pageAtom);
	const { properties } = useGetPage({ appName, pageName });
	const setInspectedResource = useSetAtom(inspectedResourceAtom);

	const mutation = useUpdatePageData({
		onSuccess: () => {
			toast({
				status: 'success',
				title: 'Component added',
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to create component',
				description: getErrorMessage(error),
			});
		},
	});

	const onSubmit = async ({ type }: any) => {
		const components =
			resource === 'widget'
				? properties?.[widgetName]?.components || []
				: properties?.[tableName]?.[resource] || [];

		const currentNames = components
			.filter((c: any) => c.component_type === type)
			.map((c: any) => c.name);

		const { name: newName, label: newLabel } = generateSequentialName({
			currentNames,
			prefix: type,
		});

		let otherProperty: any = {
			label: newLabel,
		};

		if (type === 'input') {
			otherProperty = { type: 'text', label: newLabel };
		}

		if (type === 'text') {
			otherProperty = {
				text: newName,
			};
		}
		if (type === 'select') {
			otherProperty = {
				data_type: 'string',
				use_fetcher: false,
				label: newLabel,
			};
		}

		try {
			if (resource === 'widget') {
				const currentWidget = properties[widgetName] || {};

				await mutation.mutateAsync({
					app_name: appName,
					page_name: pageName,
					properties: {
						...(properties || {}),
						[widgetName]: {
							...currentWidget,
							components: [
								...(currentWidget.components || []),
								{
									name: newName,
									component_type: type,
									...otherProperty,
								},
							],
						},
					},
				});

				setInspectedResource({
					id: newName,
					type: 'widget-component',
					meta: { widget: widgetName, resource: 'widget' },
				});
			} else {
				const currentTable = properties[tableName] || {};

				await mutation.mutateAsync({
					app_name: appName,
					page_name: pageName,
					properties: {
						...(properties || {}),
						[tableName]: {
							...currentTable,
							[resource]: [
								...(currentTable?.[resource] || []),
								{
									name: newName,
									component_type: type,
									...otherProperty,
								},
							],
						},
					},
				});

				setInspectedResource({
					id: newName,
					type: `${resource}-component`,
					meta: { table: tableName, resource },
				});
			}
		} catch (e) {
			//
		}
	};

	return (
		<Menu placement="top-start">
			<MenuButton
				as={Button}
				variant="ghost"
				size="sm"
				flexShrink="0"
				data-cy="add-component-button"
				isDisabled={!isConnected}
				isLoading={mutation.isLoading}
				{...props}
			>
				<Stack alignItems="center" justifyContent="center" direction="row">
					<Plus size="14" />
					<Box>{children || 'Add Component'}</Box>
				</Stack>
			</MenuButton>
			<MenuList zIndex="100">
				{['input', 'text', 'select', 'button', 'boolean'].map((c) => (
					<MenuItem
						onClick={() => {
							onSubmit({ type: c });
						}}
						key={c}
						fontSize="md"
					>
						{c}
					</MenuItem>
				))}
			</MenuList>
		</Menu>
	);
};
