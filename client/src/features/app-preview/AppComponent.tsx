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
import { useParams } from 'react-router-dom';

import { extractTemplateString } from '@/utils';

import { useEvent } from '@/features/app-preview/hooks';
import { InputRenderer } from '@/components/FormInput';
import { pageStateAtom, pageStateContextAtom, pageContextAtom } from '@/features/app-state';
import { useGetPage } from '@/features/page';
import { appModeAtom } from '@/features/app/atoms';
import { LabelContainer } from '@/components/LabelContainer';

import MarkdownEditor from '@/components/Editor/MarkdownEditor';
import { ACTIONS } from '@/constant';

const potentialTemplatesField = ['label', 'text', 'placeholder', 'default'];

export const AppComponent = (props: any) => {
	const { sendJsonMessage, tableName, widgetName, resource } = props;

	const { pageName, appName } = useParams();

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

	const components = useMemo(() => {
		if (resource === 'widget') {
			return pageContext[widgetName || '']?.components || {};
		}

		return pageContext[tableName || '']?.[resource] || {};
	}, [pageContext, resource, tableName, widgetName]);

	const inputState = useMemo(() => components?.[name] || {}, [components, name]);

	const [inputValues, setInputValues]: any = useAtom(pageStateAtom);

	const inputValue =
		resource === 'widget'
			? inputValues?.[widgetName || '']?.components?.[name]
			: inputValues?.[tableName]?.[resource]?.[name];

	const { availableMethods: allResourceMethods } = useGetPage({ appName, pageName });
	const availableMethods =
		resource === 'widget'
			? allResourceMethods?.[widgetName]?.[name] || []
			: allResourceMethods?.[tableName]?.[resource]?.[name] || [];

	const { isPreview } = useAtomValue(appModeAtom);
	const isEditorMode = !isPreview;

	const shouldDisplay = components?.[name]?.visible || components?.[name]?.visible === null;
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
			if (resource === 'widget' && widgetName) {
				let newWidgetState = {};
				setInputValues((old: any) => {
					newWidgetState = {
						...old,
						[widgetName]: {
							...(old[widgetName] || {}),
							components: {
								...(old[widgetName]?.components || {}),
								[inputName]: newInputValue,
							},
						},
					};
					return newWidgetState;
				});
				return newWidgetState;
			}

			if (tableName && resource) {
				let newWidgetState = {};
				setInputValues((old: any) => {
					newWidgetState = {
						...old,
						[tableName]: {
							...(old?.[tableName] || {}),
							[resource]: {
								...(old?.[tableName]?.[resource] || {}),
								[inputName]: newInputValue,
							},
						},
					};
					return newWidgetState;
				});
				return newWidgetState;
			}
			return {};
		},
		[widgetName, resource, tableName, setInputValues],
	);

	const handleComponentMethod = ({ action, state }: any) => {
		if (availableMethods.includes(action)) {
			handleEvent({
				action,
				resource: resource === 'widget' ? widgetName : tableName,
				component: name,
				newState: state,
				section: resource === 'widget' ? 'components' : resource,
			});
		}
	};

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

	const isTableComponent = resource !== 'widget';
	let componentSize = isTableComponent ? 'xs' : 'sm';

	if (componentType === 'button') {
		return (
			<Stack spacing="0.5" w="fit-content">
				<Button
					my="1.5"
					size={componentSize}
					bgColor={grayOutComponent ? 'gray.100' : ''}
					colorScheme={color || 'blue'}
					isLoading={mutation.isLoading}
					onClick={() => {
						handleComponentMethod({
							action: ACTIONS.CLICK,
						});

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
				{...(isTableComponent
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
					<FormLabel mb={isTableComponent ? 0 : '1.5'} lineHeight={1}>
						{label}
					</FormLabel>
				) : null}
				<Stack spacing="0">
					<InputRenderer
						placeholder={placeholder}
						value={inputValue}
						name={name}
						size={componentSize}
						isTableComponent={isTableComponent}
						data-cy={`input-${name}`}
						type={inputType}
						onKeyDown={(e: any) => {
							if (e.key === 'Enter') {
								handleComponentMethod({
									action: ACTIONS.SUBMIT,
								});
							}
						}}
						onChange={(newValue: any) => {
							// We need this newWidgetState because the state in pageState
							// is not up to date with the latest input value
							const newWidgetState = handleInputValue(name, newValue);

							handleComponentMethod({
								action: ACTIONS.SELECT,
								state: newWidgetState,
							});

							handleComponentMethod({
								action: ACTIONS.CHANGE,
								state: newWidgetState,
							});

							handleComponentMethod({
								action: ACTIONS.TOGGLE,
								state: newWidgetState,
							});

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
					{mutation.isLoading ? <Progress isIndeterminate isAnimated size="xs" /> : null}
				</Stack>

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
