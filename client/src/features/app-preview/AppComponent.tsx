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
import { getErrorMessage } from '@/utils';

import { useExecuteAction } from '@/features/app-preview/hooks';
import { InputRenderer } from '@/components/FormInput';
import {
	widgetComponentsAtom,
	useSyncState,
	newPageStateAtom,
	allWidgetsInputAtom,
	allWidgetStateAtom,
} from '@/features/app-state';
import { pageAtom } from '@/features/page';
import { appModeAtom } from '@/features/app/atoms';
import { useToast } from '@/lib/chakra-ui';

const sizeMap: any = {
	small: 'sm',
	medium: 'md',
	large: 'lg',
};

export const AppComponent = (props: any) => {
	const { sendJsonMessage } = props;

	const [widgetData]: any = useAtom(allWidgetStateAtom);
	const allWidgetState = widgetData.state;

	const toast = useToast();
	const { pageName, appName, widgetName } = useAtomValue(pageAtom);
	const {
		component_type: componentType,
		type,
		data_type: dataType,
		name,
		display_rules: displayRules,
		color,
		label,
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

	if (!shouldDisplay && !isEditorMode) {
		return null;
	}

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
						handleAction(onClick);
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
				{component.text}
			</Text>
		);
	}

	return (
		<FormControl key={name} bgColor={grayOutComponent ? 'gray.100' : ''}>
			{label ? <FormLabel lineHeight={1}>{label}</FormLabel> : null}
			<InputRenderer
				placeholder={component?.placeholder}
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
						variant="left-accent"
						status={inputState?.message_type || 'info'}
						height="30px"
					>
						<AlertIcon boxSize={4} />
						<AlertDescription fontSize={14}>{inputState?.message}</AlertDescription>
					</Alert>
				</div>
			) : null}
		</FormControl>
	);
};
