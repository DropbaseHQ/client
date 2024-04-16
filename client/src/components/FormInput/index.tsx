import {
	Badge,
	Box,
	Button,
	FormControl,
	FormErrorMessage,
	FormLabel,
	IconButton,
	Input,
	Menu,
	MenuButton,
	MenuItemOption,
	MenuList,
	MenuOptionGroup,
	NumberDecrementStepper,
	NumberIncrementStepper,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	Select,
	Stack,
	Text,
	Switch,
	Center,
	Portal,
	Textarea,
	Spinner,
} from '@chakra-ui/react';
import { forwardRef, useState } from 'react';
import { ChevronDown, Plus, Trash } from 'react-feather';
import { ErrorMessage } from '@hookform/error-message';
import { Controller, useFormContext } from 'react-hook-form';

import { MonacoEditor } from '@/components/Editor';
import { formatDateTimeForInput, formatDateForInput } from '@/features/smart-table/utils';

const TemplateEditor = (props: any) => {
	const [codeHeight, setCodeHeight] = useState(30);

	const handleCodeMount = (editor: any) => {
		editor.onDidContentSizeChange((event: any) => {
			const editorHeight = event.contentHeight;
			setCodeHeight(editorHeight); // Dynamically adjust height based on content
			editor.layout();
		});
	};

	return (
		<MonacoEditor
			{...props}
			options={{
				lineNumbers: 'off',
				glyphMargin: false,
				folding: false,
				// Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
				lineDecorationsWidth: 0,
				lineNumbersMinChars: 0,
			}}
			height={codeHeight}
			onMount={handleCodeMount}
		/>
	);
};

export const InputRenderer = forwardRef((props: any, ref: any) => {
	const {
		onChange,
		onBlur,
		value,
		type,
		onSelect,
		options: selectOptions,
		keys,
		hideClearOption,
		inline,
		...inputProps
	} = props;

	if (type === 'number' || type === 'integer' || type === 'float') {
		const stepperSize =
			inputProps?.size === 'xs'
				? {
						h: 3,
						css: {
							svg: {
								width: '10px',
								height: '10px',
							},
						},
				  }
				: {};

		return (
			<NumberInput
				onChange={(valueAsString, valueAsNumber) => {
					const integerNumber = Number.isNaN(valueAsNumber) ? null : valueAsNumber;

					const parsedValue =
						valueAsString.endsWith('.') ||
						valueAsString.endsWith('.0') ||
						valueAsString.endsWith('.00')
							? valueAsString
							: integerNumber;

					onChange?.(type === 'integer' ? integerNumber : parsedValue);
				}}
				size="sm"
				onBlur={() => {
					if (type === 'float' && value !== null) {
						onChange?.(parseFloat(value));
					}
				}}
				value={value === null ? '' : value}
				precision={2}
				step={type === 'integer' ? 1 : 0.01}
				{...inputProps}
			>
				<NumberInputField
					ref={ref}
					{...(inputProps?.size === 'xs'
						? {
								h: 6,
						  }
						: { h: 9 })}
				/>
				<NumberInputStepper>
					<NumberIncrementStepper {...stepperSize} />
					<NumberDecrementStepper {...stepperSize} />
				</NumberInputStepper>
			</NumberInput>
		);
	}

	if (type === 'select') {
		return (
			<Select
				onBlur={onBlur}
				onChange={(e) => {
					onChange?.(e.target.value);
				}}
				ref={ref}
				borderRadius="sm"
				size="sm"
				{...inputProps}
				value={value}
				placeholder={inputProps?.placeholder || 'Select option'}
			>
				{(selectOptions || []).map((option: any) => (
					<option key={option.name} value={option.value}>
						{option.name}
					</option>
				))}
			</Select>
		);
	}

	if (type === 'textarea') {
		return (
			<Textarea
				onBlur={onBlur}
				onChange={(e) => onChange?.(e.target.value)}
				value={value || ''}
				size="sm"
				borderRadius="sm"
				ref={ref}
				{...inputProps}
			/>
		);
	}

	if (type === 'custom-select') {
		const selectedValue = selectOptions?.find((option: any) => option.value === value);

		const valueLabel = selectedValue?.name;
		const valueRenderer = selectedValue?.render?.(selectedValue);

		const children = (
			<Text fontSize="sm">
				{valueRenderer || valueLabel || inputProps?.placeholder || 'Select option'}
			</Text>
		);

		const allOptions = selectOptions || [];

		return (
			<Menu>
				<Stack spacing="0.5">
					<MenuButton
						as={Stack}
						direction="row"
						alignItems="center"
						borderWidth="1px"
						p="2"
						borderRadius="sm"
						type="button"
						onBlur={onBlur}
						cursor={inputProps?.isDisabled ? 'not-allowed' : 'pointer'}
						{...inputProps}
					>
						<Stack w="full" spacing="0" alignItems="center" direction="row">
							<Box>{children}</Box>
							<Box ml="auto">
								<ChevronDown size="15" />
							</Box>
						</Stack>
					</MenuButton>
					{value && !hideClearOption ? (
						<Button
							onClick={() => {
								onChange(null);
							}}
							colorScheme="gray"
							alignSelf="start"
							size="sm"
							variant="link"
						>
							Clear
						</Button>
					) : null}
				</Stack>
				<Portal>
					<MenuList
						zIndex="popover"
						pointerEvents={inputProps?.isDisabled ? 'none' : 'initial'}
						borderRadius="sm"
						shadow="sm"
						p="0"
						maxH="sm"
						overflowY="auto"
					>
						{allOptions.length === 0 ? (
							<Center>
								<Text fontSize="sm">No options present</Text>
							</Center>
						) : (
							<MenuOptionGroup
								value={value}
								onChange={(newValue) => {
									onChange(newValue);
									onSelect?.(newValue);
								}}
								type="radio"
							>
								{allOptions.map((option: any, index: number) => (
									<MenuItemOption
										icon={option?.icon}
										fontSize="sm"
										key={option.name}
										value={option.value}
										data-cy={`select-option-${index}`}
									>
										{option?.render
											? option?.render(option?.value === value)
											: option.name}
									</MenuItemOption>
								))}
							</MenuOptionGroup>
						)}
					</MenuList>
				</Portal>
			</Menu>
		);
	}

	if (type === 'array') {
		const optionsToRender = value || [];
		const keysToRender = keys || ['name', 'value'];

		return (
			<Stack spacing="2">
				<Stack fontSize="xs" fontWeight="medium" letterSpacing="wide" direction="row">
					{keysToRender.map((key: any) => (
						<Box key={key} flex="1">
							{key}
						</Box>
					))}
					<Box minW="8" />
				</Stack>

				{optionsToRender.map((option: any) => {
					return (
						<Stack alignItems="center" key={option.id} direction="row">
							{keysToRender.map((key: any) => (
								<Input
									size="sm"
									flex="1"
									key={key}
									placeholder={key}
									value={option?.[key]}
									onChange={(e) => {
										onChange(
											optionsToRender.map((o: any) => {
												if (o.id === option.id) {
													return {
														...o,
														[key]: e.target.value,
													};
												}
												return o;
											}),
										);
									}}
								/>
							))}

							<IconButton
								aria-label="Delete"
								icon={<Trash size="14" />}
								size="sm"
								variant="ghost"
								colorScheme="red"
								onClick={() => {
									onChange(
										optionsToRender.filter((o: any) => o.id !== option.id),
									);
								}}
							/>
						</Stack>
					);
				})}

				<Button
					size="sm"
					leftIcon={<Plus size="14" />}
					variant="outline"
					colorScheme="gray"
					onClick={() => {
						onChange([
							...optionsToRender,
							keysToRender.reduce(
								(agg: any, key: any) => ({
									...agg,
									[key]: `${key}${optionsToRender.length + 1}`,
								}),
								{
									id: crypto.randomUUID(),
								},
							),
						]);
					}}
				>
					Add option
				</Button>
			</Stack>
		);
	}

	if (type === 'multiselect') {
		const allOptions = selectOptions || [];
		let children = <Text fontSize="sm">{inputProps?.placeholder || 'Select option'}</Text>;

		if (Array.isArray(value) && value.length > 0) {
			children = (
				<Stack spacing="1" flexWrap="wrap" direction="row">
					{value.map((v: any) => (
						<Badge
							colorScheme="gray"
							textTransform="none"
							display="inline-block"
							key={v}
							size={inputProps?.size || 'sm'}
						>
							{allOptions.find((o: any) => o.value === v)?.name || v}
						</Badge>
					))}
				</Stack>
			);
		}

		return (
			<Menu>
				<Stack
					{...(inline
						? {
								direction: 'row',
								alignItems: 'center',
						  }
						: {})}
				>
					<MenuButton
						as={Stack}
						type="button"
						direction="row"
						alignItems="center"
						borderWidth="1px"
						borderRadius="sm"
						h={inputProps?.size === 'xs' ? '6' : 'auto'}
						p="2"
						cursor={inputProps?.isDisabled ? 'not-allowed' : 'pointer'}
						{...inputProps}
					>
						<Stack w="full" spacing="0" alignItems="center" direction="row">
							<Box>{children}</Box>
							<Box ml="auto">
								<ChevronDown size="14" />
							</Box>
						</Stack>
					</MenuButton>
					{value ? (
						<Button
							onClick={() => {
								onChange(null);
							}}
							colorScheme="gray"
							alignSelf={inline ? 'center' : 'start'}
							size="sm"
							variant="link"
						>
							Clear
						</Button>
					) : null}
				</Stack>
				<MenuList
					pointerEvents={inputProps?.isDisabled ? 'none' : 'initial'}
					maxH="sm"
					overflowY="auto"
					minWidth="240px"
				>
					{allOptions.length === 0 ? (
						<Center p="2">
							<Text fontSize="sm" color="gray.700">
								No options present
							</Text>
						</Center>
					) : (
						<MenuOptionGroup
							value={(value || []).filter(Boolean)}
							onChange={(potentialNewValue: any) => {
								if (!inputProps?.isDisabled) {
									const newValue = potentialNewValue?.filter(Boolean);

									onChange(newValue);
									onSelect?.(newValue);
								}
							}}
							type="checkbox"
						>
							{allOptions.map((option: any) => (
								<MenuItemOption
									fontSize="sm"
									key={option.value}
									value={option.value}
								>
									{option.name}
								</MenuItemOption>
							))}
						</MenuOptionGroup>
					)}
				</MenuList>
			</Menu>
		);
	}

	if (type === 'sql') {
		return (
			<Box w="full" borderWidth="1px" borderColor="gray.300" borderRadius="sm" p="0.5">
				<MonacoEditor language="sql" value={value} onChange={onChange} />
			</Box>
		);
	}

	if (type === 'template') {
		return (
			<Box w="full" borderWidth="1px" p="1.5" borderRadius="sm">
				<TemplateEditor
					language="plaintext"
					{...inputProps}
					value={value}
					onChange={onChange}
				/>
			</Box>
		);
	}

	if (type === 'boolean') {
		return (
			<Switch
				size="sm"
				mx="auto"
				isChecked={!!value}
				onBlur={onBlur}
				onChange={(e) => {
					onChange?.(e.target.checked);
				}}
				ref={ref}
				{...inputProps}
			/>
		);
	}

	if (type === 'markdown') {
		return (
			<Box w="full" borderWidth="1px" p="1.5" borderRadius="sm">
				<TemplateEditor
					language="markdown"
					{...inputProps}
					value={value}
					onChange={onChange}
				/>
			</Box>
		);
	}

	let processedValue = value;

	if (type === 'datetime' && typeof value === 'number') {
		processedValue = formatDateTimeForInput(value);
	} else if (type === 'date' && typeof value === 'number') {
		processedValue = formatDateForInput(value);
	}

	return (
		<Input
			onBlur={onBlur}
			onChange={(e) => onChange?.(e.target.value)}
			value={processedValue || ''}
			size="sm"
			ref={ref}
			type={type === 'datetime' ? 'datetime-local' : type}
			{...inputProps}
		/>
	);
});

export const BaseFormInput = ({
	id,
	type,
	validation,
	options: selectOptions,
	...inputProps
}: any) => {
	const { control } = useFormContext();

	return (
		<Controller
			control={control}
			name={id}
			rules={validation}
			render={({ field: { onChange, onBlur, value, ref } }) => {
				return (
					<InputRenderer
						onChange={onChange}
						onBlur={onBlur}
						value={value}
						ref={ref}
						type={type}
						options={selectOptions}
						{...inputProps}
					/>
				);
			}}
		/>
	);
};

export const FormInput = ({
	name,
	type,
	validation,
	options: selectOptions,
	id,
	...inputProps
}: any) => {
	const {
		formState: { errors },
	} = useFormContext();

	return (
		<FormControl isInvalid={!!errors?.[id]} key={name}>
			{name && (
				<FormLabel>
					{inputProps.isLoading ? (
						<Spinner
							thickness="2px"
							speed="0.65s"
							emptyColor="gray.200"
							color="blue.500"
							size="xs"
							ml="1"
							mr="1"
						/>
					) : null}
					{name}{' '}
					{inputProps?.required && (
						<Box as="span" color="red.500">
							*
						</Box>
					)}
				</FormLabel>
			)}

			<BaseFormInput
				name={name}
				id={id}
				type={type}
				options={selectOptions}
				validation={validation}
				data-cy={`property-${name}`}
				{...inputProps}
			/>
			<ErrorMessage
				errors={errors}
				name={id}
				render={({ message }) => <FormErrorMessage>{message}</FormErrorMessage>}
			/>
		</FormControl>
	);
};
