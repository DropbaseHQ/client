import {
	Alert,
	AlertDescription,
	AlertIcon,
	Button,
	FormControl,
	FormLabel,
	Progress,
	Stack,
} from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';

import { extractTemplateString } from '@/utils';

import { useEvent } from '@/features/app-preview/hooks';
import { InputRenderer } from '@/components/FormInput';
import { pageStateAtom, pageStateContextAtom, pageContextAtom } from '@/features/app-state';
import { pageAtom, useGetPage } from '@/features/page';
import { appModeAtom } from '@/features/app/atoms';
import { LabelContainer } from '@/components/LabelContainer';

import MarkdownEditor from '@/components/Editor/MarkdownEditor';
import { ACTIONS } from '@/constant';

const potentialTemplatesField = ['label', 'text', 'placeholder', 'default'];

export const AppComponent = (props: any) => {
	const { sendJsonMessage, widgetName, inline } = props;

	const [{ pageName, appName }] = useAtom(pageAtom);

	const { handleEvent, mutation } = useEvent({});

	const {
		component_type: componentType,
		data_type: type,
		name,
		display_rules: displayRules,
		color,
		...component
	} = props;

	const pageState = useAtomValue(pageStateContextAtom);
	const pageContext = useAtomValue(pageContextAtom) as any;
	const widgetComponents = useMemo(
		() => pageContext[widgetName || '']?.components || {},
		[pageContext, widgetName],
	);

	const inputState = useMemo(() => widgetComponents?.[name] || {}, [widgetComponents, name]);

	const [inputValues, setInputValues]: any = useAtom(pageStateAtom);
	const inputValue = inputValues?.[widgetName || '']?.[name];

	const { availableMethods: allResourceMethods } = useGetPage({ appName, pageName });
	const availableMethods = allResourceMethods?.[widgetName]?.[name] || [];

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

	if (!shouldDisplay && !isEditorMode) {
		return null;
	}

	let componentSize = inline ? 'xs' : 'sm';

	if (componentType === 'button') {
		return (
			<Stack spacing="0.5" w="fit-content">
				<Button
					my="1.5"
					size={inline ? 'xs' : 'sm'}
					bgColor={grayOutComponent ? 'gray.100' : ''}
					colorScheme={color || 'blue'}
					isLoading={mutation.isLoading}
					onClick={() => {
						if (availableMethods?.includes(ACTIONS.CLICK)) {
							handleEvent({
								action: ACTIONS.CLICK,
								resource: widgetName,
								component: name,
							});
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
			<Stack spacing="0.5" bgColor={grayOutComponent ? 'gray.100' : ''}>
				<MarkdownEditor color={color} text={text} />
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
		componentSize = 'sm';
		inputType = 'boolean';
	}

	if (inputType === 'text' && component?.multiline) {
		inputType = 'textarea';
	}

	return (
		<Stack spacing="0.5">
			<FormControl
				{...(inline
					? {
							as: Stack,
							direction: 'row',
							alignItems: 'center',
							spacing: '0',
					  }
					: {})}
				key={name}
				bgColor={grayOutComponent ? 'gray.100' : ''}
			>
				{label ? (
					<FormLabel mb={inline ? 0 : '1.5'} lineHeight={1}>
						{label}
					</FormLabel>
				) : null}
				<InputRenderer
					placeholder={placeholder}
					value={inputValue}
					name={name}
					size={componentSize}
					inline={inline}
					data-cy={`input-${name}`}
					type={inputType}
					onKeyDown={(e: any) => {
						if (e.key === 'Enter' && availableMethods?.includes(ACTIONS.SUBMIT)) {
							handleEvent({
								action: ACTIONS.SUBMIT,
								resource: widgetName,
								component: name,
							});
						}
					}}
					onChange={(newValue: any) => {
						// We need this newWidgetState because the state in pageState
						// is not up to date with the latest input value
						const newWidgetState = handleInputValue(name, newValue);
						if (availableMethods?.includes(ACTIONS.SELECT)) {
							handleEvent({
								action: ACTIONS.SELECT,
								resource: widgetName,
								component: name,
								newState: newWidgetState,
							});
						}

						if (availableMethods?.includes(ACTIONS.CHANGE)) {
							handleEvent({
								action: ACTIONS.CHANGE,
								resource: widgetName,
								component: name,
								newState: newWidgetState,
							});
						}

						if (availableMethods?.includes(ACTIONS.TOGGLE)) {
							handleEvent({
								action: ACTIONS.TOGGLE,
								resource: widgetName,
								component: name,
								newState: newWidgetState,
							});
						}

						sendJsonMessage({
							type: 'display_rule',
							state_context: {
								...pageState,
								state: newWidgetState,
							},
							app_name: appName,
							page_name: pageName,
						});
					}}
					options={inputState?.options || component?.options}
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

				{mutation.isLoading ? <Progress isIndeterminate isAnimated size="xs" /> : null}
			</FormControl>

			{isPreview ? null : <LabelContainer.Code>{name}</LabelContainer.Code>}
		</Stack>
	);
};
