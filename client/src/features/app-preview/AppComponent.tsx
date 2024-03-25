import {
	Alert,
	AlertDescription,
	AlertIcon,
	Button,
	FormControl,
	FormLabel,
	Stack,
	Text,
} from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
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
import { LabelContainer } from '@/components/LabelContainer';
import { useFetcherData } from '../smart-table/hooks';

const sizeMap: any = {
	small: 'sm',
	medium: 'md',
	large: 'lg',
};

const potentialTemplatesField = ['label', 'text', 'placeholder', 'default'];

export const AppComponent = (props: any) => {
	const { sendJsonMessage } = props;

	const toast = useToast();
	const [{ pageName, appName, widgetName, widgets }, setPageContext] = useAtom(pageAtom);
	const {
		component_type: componentType,
		data_type: type,
		name,
		display_rules: displayRules,
		color,
		on_click: onClick,
		...component
	} = props;

	const pageState = useAtomValue(newPageStateAtom);
	const allWidgetComponents = useAtomValue(widgetComponentsAtom) as any;
	const widgetComponents = useMemo(
		() => allWidgetComponents[widgetName || '']?.components || {},
		[allWidgetComponents, widgetName],
	);

	const inputState = useMemo(() => widgetComponents?.[name] || {}, [widgetComponents, name]);

	const fetcher = component?.fetcher;

	const fetcherData = useFetcherData({
		fetcher,
		appName,
		pageName,
	});

	const getInputOptions = () => {
		if (componentType === 'select' && component?.use_fetcher) {
			const nameColumn = component?.name_column;
			const valueColumn = component?.value_column;
			const duplicateCheck = new Set();
			return fetcherData?.rows
				?.filter((row: any) =>
					duplicateCheck.has(row?.[nameColumn])
						? false
						: duplicateCheck.add(row?.[nameColumn]),
				)
				?.map((row: any) => ({
					name: String(row?.[nameColumn]),
					value: String(row?.[valueColumn]),
				}));
		}

		return inputState.options || component?.options;
	};

	const [inputValues, setInputValues]: any = useAtom(allWidgetsInputAtom);
	const inputValue = inputValues?.[widgetName || '']?.[name];

	const syncState = useSyncState();

	const { isPreview } = useAtomValue(appModeAtom);
	const isEditorMode = !isPreview;

	const shouldDisplay =
		widgetComponents?.[name]?.visible || widgetComponents?.[name]?.visible === null;
	const grayOutComponent = !shouldDisplay && isEditorMode;

	const {
		label,
		text,
		placeholder,
		default: defaultValue,
	} = potentialTemplatesField.reduce(
		(agg: any, field: any) => ({
			...agg,
			[field]: extractTemplateString(component?.[field], pageState),
		}),
		{},
	);

	const handleInputValue = useCallback(
		(inputName: any, newInputValue: any) => {
			if (widgetName) {
				let newWidgetState = {};
				setInputValues((old: any) => {
					newWidgetState = {
						...old,
						[widgetName]: {
							...(old[widgetName] || {}),
							[inputName]: newInputValue,
						},
					};
					return newWidgetState;
				});
				return newWidgetState;
			}
			return {};
		},
		[widgetName, setInputValues],
	);

	useEffect(() => {
		/**
		 * Set default values to component
		 */
		if (defaultValue !== null && defaultValue !== undefined && name) {
			const timeoutId = setTimeout(() => {
				handleInputValue(name, defaultValue);
				clearTimeout(timeoutId);
			}, 100);
		}
	}, [defaultValue, name, handleInputValue, setInputValues]);

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

	const handleEvent = (event: any) => {
		if (event.type === 'widget') {
			const widget = widgets?.find((w: any) => w.name === event.value);

			if (widget?.type === 'modal') {
				setPageContext((oldPage: any) => ({
					...oldPage,
					widgetName: event.value,
					modals: [
						...oldPage.modals.filter((m: any) => m.name !== event.value),
						{
							name: event.value,
							caller: widgetName,
						},
					],
				}));
			} else {
				setPageContext((oldPage: any) => ({
					...oldPage,
					modals: [],
					widgetName: event.value,
				}));
			}
		} else if (event.type === 'function') {
			handleAction(event.value);
		}
	};

	if (!shouldDisplay && !isEditorMode) {
		return null;
	}

	if (componentType === 'button') {
		return (
			<Stack spacing="0.5" w="fit-content">
				<Button
					my="1.5"
					size="sm"
					isLoading={actionMutation.isLoading}
					bgColor={grayOutComponent ? 'gray.100' : ''}
					colorScheme={color || 'blue'}
					onClick={() => {
						if (onClick) {
							handleEvent(onClick);
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
				{isPreview ? null : <LabelContainer.Code>{name}</LabelContainer.Code>}
			</Stack>
		);
	}

	if (componentType === 'text') {
		return (
			<Stack spacing="0.5">
				<Text
					fontSize={sizeMap[component.size]}
					color={component.color || `${component.color}.500`}
					bgColor={grayOutComponent ? 'gray.100' : ''}
				>
					{text}
				</Text>

				{isPreview ? null : <LabelContainer.Code>{name}</LabelContainer.Code>}
			</Stack>
		);
	}

	// FIXME: this logic is repeated in component editor, find a way to reuse
	let inputType = type;

	if (componentType === 'select') {
		inputType = 'select';

		if (component?.multiple) {
			inputType = 'multiselect';
		}
	}

	if (componentType === 'boolean') {
		inputType = 'boolean';
	}

	if (inputType === 'text' && component?.multiline) {
		inputType = 'textarea';
	}

	return (
		<Stack spacing="0.5">
			<FormControl key={name} bgColor={grayOutComponent ? 'gray.100' : ''}>
				{label ? <FormLabel lineHeight={1}>{label}</FormLabel> : null}
				<InputRenderer
					placeholder={placeholder}
					value={inputValue}
					name={name}
					data-cy={`input-${name}`}
					type={inputType}
					onChange={(newValue: any) => {
						// We need this newWidgetState because the state in pageState
						// is not up to date with the latest input value
						const newWidgetState = handleInputValue(name, newValue);

						if (component.on_change) {
							handleEvent(component.on_change);
						}

						if (component.on_toggle) {
							handleEvent(component.on_toggle);
						}

						sendJsonMessage({
							type: 'display_rule',
							state_context: {
								...pageState,
								state: {
									...(pageState?.state || {}),
									widgets: newWidgetState,
								},
							},
							app_name: appName,
							page_name: pageName,
						});
					}}
					options={getInputOptions()}
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

			{isPreview ? null : <LabelContainer.Code>{name}</LabelContainer.Code>}
		</Stack>
	);
};
