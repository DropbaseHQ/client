import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSetAtom } from 'jotai';
import { Save, Trash } from 'react-feather';
import { useParams } from 'react-router-dom';
import { Stack, IconButton, Text, ButtonGroup, StackDivider } from '@chakra-ui/react';
import { FormInput } from '@/components/FormInput';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { useResourceFields } from '@/features/app-builder/hooks';
import { inspectedResourceAtom } from '@/features/app-builder/atoms';
import { useGetPage, useUpdatePageData } from '@/features/page';
import { LabelContainer } from '@/components/LabelContainer';
import { NameEditor } from '@/features/app-builder/components/NameEditor';

export const WidgetProperties = ({ widgetId }: any) => {
	const toast = useToast();
	const setInspectedResource = useSetAtom(inspectedResourceAtom);

	const { fields } = useResourceFields();
	const currentCategories = ['Default'];

	const { pageName, appName } = useParams();
	const { widgets, properties, refetch } = useGetPage({ appName, pageName });

	const widget = widgets.find((w: any) => w.name === widgetId);

	const mutation = useUpdatePageData({
		onSuccess: () => {
			refetch();
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to update properties',
				description: getErrorMessage(error),
			});
		},
	});
	const deleteMutation = useUpdatePageData({
		onSuccess: () => {
			setInspectedResource({
				id: null,
				type: null,
				meta: null,
			});
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to delete widget',
				description: getErrorMessage(error),
			});
		},
	});

	const methods = useForm();
	const {
		formState: { isDirty },
		reset,
	} = methods;

	useEffect(() => {
		reset(widget, {
			keepDirty: false,
			keepDirtyValues: false,
		});
	}, [widget, reset]);

	const onSubmit = (formValues: any) => {
		if (widgetId) {
			const currentWidget = properties[widgetId] || {};

			mutation.mutate({
				app_name: appName,
				page_name: pageName,
				properties: {
					...(properties || {}),
					[widgetId]: {
						...currentWidget,
						...formValues,
					},
				},
			});
		}
	};

	const handleUpdateName = async (newName: any) => {
		try {
			const currentWidget = properties[widgetId] || {};

			await mutation.mutateAsync({
				app_name: appName,
				page_name: pageName,
				properties: {
					...(properties || {}),
					[widgetId]: {
						...currentWidget,
						name: newName,
					},
				},
			});
			setInspectedResource({
				id: newName,
				type: 'widget',
				meta: null,
			});
		} catch (e) {
			//
		}
	};

	const handleDeleteWidget = () => {
		if (widgetId) {
			const { [widgetId]: deletedWidget, ...rest } = properties;

			deleteMutation.mutate({
				app_name: appName,
				page_name: pageName,
				properties: rest,
			});
		}
	};

	return (
		<form onSubmit={methods.handleSubmit(onSubmit)}>
			<FormProvider {...methods}>
				<Stack key={widgetId}>
					<Stack
						py="2"
						px="4"
						borderBottomWidth="1px"
						flex="1"
						alignItems="center"
						direction="row"
					>
						<Stack direction="row" alignItems="center">
							<LabelContainer data-cy="widget-pane-name">
								<LabelContainer.Code>{widgetId}</LabelContainer.Code>
							</LabelContainer>

							{false ? (
								<NameEditor
									value={widgetId}
									currentNames={(widgets || []).map((w: any) => w.name)}
									onUpdate={handleUpdateName}
									resource="widget"
								/>
							) : null}
						</Stack>

						<ButtonGroup ml="auto" size="xs">
							{isDirty ? (
								<IconButton
									aria-label="Update widget"
									isLoading={mutation.isLoading}
									type="submit"
									data-cy="update-widget"
									onClick={(e) => {
										e.stopPropagation();
									}}
									icon={<Save size="14" />}
								/>
							) : null}
							<IconButton
								aria-label="Delete widget"
								variant="ghost"
								colorScheme="red"
								isLoading={deleteMutation.isLoading}
								onClick={handleDeleteWidget}
								icon={<Trash size="14" />}
							/>
						</ButtonGroup>
					</Stack>

					<Stack spacing="0" h="full" overflowY="auto" divider={<StackDivider />}>
						{currentCategories.map((category: any) => (
							<Stack key={category} spacing="3" p="3">
								{category.toLowerCase() === 'default' ? null : (
									<Text fontSize="md" fontWeight="semibold">
										{category}
									</Text>
								)}
								<Stack spacing="3">
									{fields?.widget
										?.filter((property: any) => property.category === category)
										.map((property: any) => {
											if (
												property?.name === 'name' ||
												property.name === 'block_type' ||
												property.name === 'components'
											) {
												return null;
											}

											return (
												<FormInput
													{...property}
													id={property.name}
													type={property.type}
													key={property.name}
													name={property.title}
													options={(
														property.enum ||
														property.options ||
														[]
													).map((o: any) => ({
														name: o,
														value: o,
													}))}
												/>
											);
										})}
								</Stack>
							</Stack>
						))}
					</Stack>
				</Stack>
			</FormProvider>
		</form>
	);
};
