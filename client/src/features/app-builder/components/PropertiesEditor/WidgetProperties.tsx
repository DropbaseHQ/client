import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAtomValue, useSetAtom } from 'jotai';
import { Save, Trash } from 'react-feather';
import { Stack, Text, IconButton, ButtonGroup, StackDivider } from '@chakra-ui/react';
import { useResourceFields } from '@/features/app-builder/hooks';
import { FormInput } from '@/components/FormInput';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { inspectedResourceAtom } from '@/features/app-builder/atoms';
import { pageAtom, useGetPage, useUpdatePageData } from '@/features/page';

export const WidgetProperties = ({ widgetId }: any) => {
	const toast = useToast();
	const setInspectedResource = useSetAtom(inspectedResourceAtom);
	const { fields } = useResourceFields();

	const { pageName, appName } = useAtomValue(pageAtom);
	const { widgets, properties, refetch } = useGetPage({ appName, pageName });

	const widget = widgets.find((w: any) => w.name === widgetId);

	const mutation = useUpdatePageData({
		onSuccess: () => {
			refetch();
			setInspectedResource({
				id: null,
				type: 'widget',
			});
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
			mutation.mutate({
				app_name: appName,
				page_name: pageName,
				properties: {
					...(properties || {}),
					widgets: properties?.widgets.map((w: any) =>
						w.name === widgetId ? { ...w, ...formValues } : w,
					),
				},
			});
		}
	};

	const handleDeleteWidget = () => {
		if (properties?.widgets.length == 1) {
			toast({
				status: 'error',
				title: 'Failed to delete widget',
				description: 'Your app must have atleast one widget',
			});

			return;
		}

		if (widgetId) {
			deleteMutation.mutate({
				app_name: appName,
				page_name: pageName,
				properties: {
					...(properties || {}),
					widgets: properties?.widgets.filter((w: any) => w.name !== widgetId),
				},
			});
		}
	};

	return (
		<Stack h="full" overflowY="auto" w="full" bg="white">
			<form onSubmit={methods.handleSubmit(onSubmit)}>
				<FormProvider {...methods}>
					<Stack
						py="2"
						px="4"
						borderBottomWidth="1px"
						flex="1"
						alignItems="center"
						direction="row"
					>
						<Text fontWeight="semibold" fontSize="lg">
							{widgetId || ''} Properties
						</Text>

						<ButtonGroup ml="auto" size="xs">
							{isDirty ? (
								<IconButton
									aria-label="Update widget"
									isLoading={mutation.isLoading}
									type="submit"
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
					<Stack spacing="0" divider={<StackDivider />}>
						<Stack spacing="3" p="3">
							<Stack>
								{fields?.widget?.map((property: any) => {
									return (
										<FormInput
											{...property}
											id={property.name}
											type={property.type}
											key={property.name}
										/>
									);
								})}
							</Stack>
						</Stack>
					</Stack>
				</FormProvider>
			</form>
		</Stack>
	);
};
