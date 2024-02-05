import {
	Alert,
	AlertDescription,
	AlertIcon,
	Button,
	FormControl,
	FormLabel,
	Text,
} from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';
import { extractTemplateString, getErrorMessage } from '@/utils';

import { useExecuteAction } from '@/features/app-preview/hooks';
import { InputRenderer } from '@/components/FormInput';
import {
	widgetComponentsAtom,
	useSyncState,
	newPageStateAtom,
	allWidgetsInputAtom,
} from '@/features/app-state';
import { pageAtom } from '@/features/page';
import { appModeAtom } from '@/features/app/atoms';
import { useToast } from '@/lib/chakra-ui';

const sizeMap: any = {
	small: 'sm',
	medium: 'md',
	large: 'lg',
};

const potentialTemplatesField = ['label', 'text', 'placeholder'];

export const AppComponent = (props: any) => {
	const { sendJsonMessage } = props;

	const toast = useToast();
	const [{ pageName, appName, widgetName, widgets }, setPageContext] = useAtom(pageAtom);
	const {
		component_type: componentType,
		type,
		data_type: dataType,
		name,
		display_rules: displayRules,
		color,
		on_click: onClick,
		...component
	} = props;

	const pageState = useAtomValue(newPageStateAtom);
	const [allWidgetComponents, setWidgetComponentValues] = useAtom(widgetComponentsAtom) as any;
	const widgetComponents = allWidgetComponents[widgetName || '']?.components || {};

	const inputState = widgetComponents?.[name] || {};

	const inputValues: any = useAtomValue(allWidgetsInputAtom);
	const inputValue = inputValues?.[widgetName || '']?.[name];

	const syncState = useSyncState();

	const { isPreview } = useAtomValue(appModeAtom);
	const isEditorMode = !isPreview;

	const shouldDisplay =
		widgetComponents?.[name]?.visible || widgetComponents?.[name]?.visible === null;
	const grayOutComponent = !shouldDisplay && isEditorMode;

	const actionMutation = useExecuteAction({
		onSuccess: (data: any) => {
			syncState(data);
		},
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to execute action',
				description: getErrorMessage(error),
			});
		},
	});

	const handleAction = (actionName: string) => {
		actionMutation.mutate({
			pageName,
			appName,
			functionName: actionName,
			pageState,
		});
	};

	const handleClick = (clickEvent: any) => {
		if (clickEvent.type === 'widget') {
			const widget = widgets?.find((w: any) => w.name === clickEvent.value);

			if (widget?.type === 'modal') {
				setPageContext((oldPage: any) => ({
					...oldPage,
					widgetName: clickEvent.value,
					modals: [
						...oldPage.modals,
						{
							name: clickEvent.value,
							caller: widgetName,
						},
					],
				}));
			} else {
				setPageContext((oldPage: any) => ({
					...oldPage,
					widgetName: clickEvent.value,
				}));
			}
		} else if (clickEvent.type === 'function') {
			handleAction(clickEvent.value);
		}
	};

	if (!shouldDisplay && !isEditorMode) {
		return null;
	}

	const { label, text, placeholder } = potentialTemplatesField.reduce(
		(agg: any, field: any) => ({
			...agg,
			[field]: extractTemplateString(component?.[field], pageState) || '',
		}),
		{},
	);

	if (componentType === 'button') {
		return (
			<Button
				my="1.5"
				size="sm"
				isLoading={actionMutation.isLoading}
				bgColor={grayOutComponent ? 'gray.100' : ''}
				colorScheme={color || 'blue'}
				onClick={() => {
					if (onClick) {
						handleClick(onClick);
					}
					sendJsonMessage({
						type: 'display_rule',
						state_context: pageState,
						app_name: appName,
						page_name: pageName,
					});
				}}
			>
				{label}
			</Button>
		);
	}

	if (componentType === 'text') {
		return (
			<Text
				fontSize={sizeMap[component.size]}
				color={component.color || `${component.color}.500`}
				bgColor={grayOutComponent ? 'gray.100' : ''}
			>
				{text}
			</Text>
		);
	}

	return (
		<FormControl key={name} bgColor={grayOutComponent ? 'gray.100' : ''}>
			{label ? <FormLabel lineHeight={1}>{label}</FormLabel> : null}
			<InputRenderer
				placeholder={placeholder}
				value={inputValue}
				name={name}
				type={componentType === 'select' ? 'select' : dataType || type}
				onChange={(newValue: any) => {
					setWidgetComponentValues({
						[name]: newValue,
					});

					if (component.on_change) {
						handleAction(component.on_change);
					}
					sendJsonMessage({
						type: 'display_rule',
						state_context: pageState,
						app_name: appName,
						page_name: pageName,
					});
				}}
				options={inputState.options || component.options}
			/>

			{inputState?.message ? (
				<div>
					<Alert
						bgColor="transparent"
						status={inputState?.message_type || 'info'}
						pl={0}
						pt={1}
					>
						<AlertIcon boxSize={4} mr={2} />
						<AlertDescription fontSize="sm">{inputState?.message}</AlertDescription>
					</Alert>
				</div>
			) : null}
		</FormControl>
	);
};
