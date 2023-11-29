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
} from '@chakra-ui/react';
import { forwardRef } from 'react';
import { ChevronDown, Plus, Trash } from 'react-feather';
import { ErrorMessage } from '@hookform/error-message';
import { Controller, useFormContext } from 'react-hook-form';

import { MonacoEditor } from '@/components/Editor';

export const InputRenderer = forwardRef((props: any, ref: any) => {
	const { onChange, onBlur, value, type, options: selectOptions, ...inputProps } = props;

	if (type === 'number') {
		return (
			<NumberInput
				onChange={(_, valueAsNumber) => {
					onChange?.(valueAsNumber);
				}}
				size="sm"
				onBlur={onBlur}
				value={value === null ? '' : value}
				{...inputProps}
			>
				<NumberInputField ref={ref} />
				<NumberInputStepper>
					<NumberIncrementStepper />
					<NumberDecrementStepper />
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
				size="sm"
				{...inputProps}
				value={value}
				placeholder="Select option"
			>
				{(selectOptions || []).map((option: any) => (
					<option key={option.name} value={option.value}>
						{option.name}
					</option>
				))}
			</Select>
		);
	}

	if (type === 'array') {
		const optionsToRender = value || [];

		return (
			<Stack spacing="2">
				<Stack fontSize="xs" fontWeight="medium" letterSpacing="wide" direction="row">
					<Box flex="1">Name</Box>
					<Box flex="1">Value</Box>
					<Box minW="8" />
				</Stack>

				{optionsToRender.map((option: any) => {
					return (
						<Stack alignItems="center" key={option.id} direction="row">
							<Input
								size="sm"
								flex="1"
								placeholder="name"
								value={option.name}
								onChange={(e) => {
									onChange(
										optionsToRender.map((o: any) => {
											if (o.id === option.id) {
												return {
													...o,
													name: e.target.value,
													value: e.target.value,
												};
											}
											return o;
										}),
									);
								}}
							/>
							<Input
								size="sm"
								flex="1"
								placeholder="value"
								value={option.value}
								onChange={(e) => {
									onChange(
										optionsToRender.map((o: any) => {
											if (o.id === option.id) {
												return {
													...o,
													value: e.target.value,
												};
											}
											return o;
										}),
									);
								}}
							/>
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
							{
								name: `option${optionsToRender.length + 1}`,
								value: `value${optionsToRender.length + 1}`,
								id: crypto.randomUUID(),
							},
						]);
					}}
				>
					Add option
				</Button>
			</Stack>
		);
	}

	if (type === 'multiselect') {
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
							size="sm"
						>
							{v}
						</Badge>
					))}
				</Stack>
			);
		}

		return (
			<Menu>
				<MenuButton
					as={Stack}
					direction="row"
					alignItems="center"
					borderWidth="1px"
					p="1.5"
				>
					<Stack w="full" spacing="0" alignItems="center" direction="row">
						<Box>{children}</Box>
						<Box ml="auto">
							<ChevronDown size="14" />
						</Box>
					</Stack>
				</MenuButton>
				<MenuList maxH="lg" overflowY="auto" minWidth="240px">
					<MenuOptionGroup value={value || []} onChange={onChange} type="checkbox">
						{(selectOptions || []).map((option: any) => (
							<MenuItemOption fontSize="md" key={option.name} value={option.value}>
								{option.name}
							</MenuItemOption>
						))}
					</MenuOptionGroup>
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

	if (type === 'boolean') {
		return (
			<Switch
				size="sm"
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

	return (
		<Input
			onBlur={onBlur}
			onChange={(e) => onChange?.(e.target.value)}
			value={value || ''}
			size="sm"
			ref={ref}
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
			{name ? <FormLabel>{name}</FormLabel> : null}

			<BaseFormInput
				name={name}
				id={id}
				type={type}
				options={selectOptions}
				validation={validation}
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
