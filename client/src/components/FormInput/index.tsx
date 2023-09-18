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
	const { onChange, onBlur, value, type, enum: selectOptions } = props;

	if (type === 'number') {
		return (
			<NumberInput
				onChange={(_, valueAsNumber) => {
					onChange(valueAsNumber);
				}}
				size="sm"
				onBlur={onBlur}
				value={value === null ? '' : value}
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
					onChange(e.target.value);
				}}
				value={value}
				ref={ref}
				size="sm"
				placeholder="Select option"
			>
				{/* {options.map((option: any) => (
								<option key={option.value} value={option.value}>
									{option.name}{' '}
								</option>
							))} */}

				{selectOptions.map((option: any) => (
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
				onChange={(e) => onChange(e.target.value)}
				ref={ref}
			/>
		);
	}

	return (
		<Input
			onBlur={onBlur}
			onChange={(e) => onChange(e.target.value)}
			value={value || ''}
			size="sm"
			ref={ref}
		/>
	);
});

export const BaseFormInput = ({ id, type, validation, enum: selectOptions }: any) => {
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
						enum={selectOptions}
					/>
				);
			}}
		/>
	);
};

export const FormInput = ({ name, type, validation, enum: selectOptions, id }: any) => {
	const {
		formState: { errors },
	} = useFormContext();

	return (
		<FormControl isInvalid={!!errors?.[id]} key={name}>
			<FormLabel>{name}</FormLabel>

			<BaseFormInput
				name={name}
				id={id}
				type={type}
				enum={selectOptions}
				validation={validation}
			/>
			<ErrorMessage
				errors={errors}
				name={id}
				render={({ message }) => <FormErrorMessage>{message}</FormErrorMessage>}
			/>
		</FormControl>
	);
};
