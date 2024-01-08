import { Button, FormControl, FormHelperText, FormLabel, Text } from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';
import { getErrorMessage } from '@/utils';

import { useExecuteAction } from '@/features/app-preview/hooks';
import { InputRenderer } from '@/components/FormInput';
import {
	widgetComponentsAtom,
	useSyncState,
	newPageStateAtom,
	allWidgetsInputAtom,
} from '@/features/app-state';
import { pageAtom } from '@/features/page';
import { checkAllRulesPass } from '@/features/app-preview/utils';
import { appModeAtom } from '@/features/app/atoms';
import { useToast } from '@/lib/chakra-ui';

const sizeMap: any = {
	small: 'sm',
	medium: 'md',
	large: 'lg',
};

export const AppComponent = (props: any) => {
	const { sendJsonMessage } = props;

	const toast = useToast();
	const { pageName, appName, widgetName } = useAtomValue(pageAtom);
	const {
		component_type: componentType,
		type,
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

	const allUserInputValues: any = useAtomValue(allWidgetsInputAtom);

	const widgetInputs = allUserInputValues?.[widgetName || ''] || {};

	const syncState = useSyncState();

	const { isPreview } = useAtomValue(appModeAtom);
	const isEditorMode = !isPreview;

	const shouldDisplay = checkAllRulesPass({
		values: widgetInputs,
		rules: displayRules,
	});
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
				value={inputState?.value}
				name={name}
				type={componentType === 'select' ? 'select' : type}
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

			{inputState?.message ? <FormHelperText>{inputState.message}</FormHelperText> : null}
		</FormControl>
	);
};
