import {
	FormControl,
	FormErrorMessage,
	FormLabel,
	Input,
	NumberDecrementStepper,
	NumberIncrementStepper,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	Select,
	Switch,
} from '@chakra-ui/react';
import { forwardRef } from 'react';
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
				value={value}
				ref={ref}
				size="sm"
				{...inputProps}
				placeholder="Select option"
			>
				{(selectOptions || []).map((option: any) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</Select>
		);
	}

	if (type === 'sql') {
		return <MonacoEditor language="sql" value={value} onChange={onChange} />;
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
