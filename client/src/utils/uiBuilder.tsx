/* eslint-disable  */
import { useEffect, useState } from 'react';
import { data, doActions, getData } from './data';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { useQuery } from 'react-query';
import {
	Box,
	FormLabel,
	FormControl,
	Button,
	NumberInput,
	NumberInputField,
	Select,
	Input as ChakraInput,
} from '@chakra-ui/react';
import axios from 'axios';

const fetchUIJson = async () => {
	const { data } = await axios.post('http://localhost:8000/components/some_id/convert', {
		code: 'name_input = UIInput(\r\n    name="name",\r\n    type="input",\r\n    label="Name",\r\n    required=True,\r\n    validation="",\r\n    error="",\r\n    number=3\r\n)\r\naddress_input = UIInput(\r\n    name="address",\r\n    type="input",\r\n    label="Address",\r\n    required=True,\r\n    validation="",\r\n    error="",\r\n    number=3,\r\n    depends="name",\r\n    depends_value="John"\r\n)',
		app_id: '1234',
	});
	return data;
};

const useGetUIJson = () => {
	const { data, ...rest } = useQuery('uiJson', fetchUIJson);
	const components = data?.components || [];
	const parsedComponents = components.map((c: any) => {
		const parsedComponent = JSON.parse(c);
		return parsedComponent;
	});
	return { components: parsedComponents, ...rest };
};

export const CustomInput = (props) => {
	const {
		name,
		type,
		options,
		depends,
		depends_value,
		setFormData,
		label,
		action,
		post_action,
		resetFields,
	} = props;
	const { watch, register, getValues, reset } = useFormContext();
	const dependentValue = watch(depends);

	const [loading, setLoading] = useState(false);

	const getOptions = async () => {
		if (!loading) {
			setLoading(true);
			const fetchedOptions = await getData(options);

			setFormData((data) => {
				return data.map((d) => {
					if (d.name === name) {
						return {
							...d,
							...fetchedOptions,
						};
					}

					return d;
				});
			});
			setLoading(false);
		}
	};

	const handleAction = async () => {
		try {
			await doActions(action, getValues());
			reset(resetFields);
			if (post_action) {
				console.log(`Performing post action: ${post_action}`);
				await getData(post_action);
			}
		} catch (e) {
			//
		}
	};

	useEffect(() => {
		if (typeof options === 'string') {
			if (depends && depends_value === dependentValue) {
				getOptions();
			} else if (!depends) {
				getOptions();
			}
		}
	}, [options, depends, dependentValue]);

	if (loading) {
		return 'Loading....';
	}

	if ((depends && dependentValue && depends_value === dependentValue) || !depends) {
		if (type === 'select') {
			if (typeof options === 'string') {
				return null;
			}
			return (
				<Box>
					<FormControl>
						<FormLabel htmlFor={name}>{name}</FormLabel>
						<br />
						<Select id={name} placeholder={name} {...register(name)}>
							<option>Select {name}</option>
							{options?.map((o) => <option key={o}>{o}</option>)}
						</Select>
					</FormControl>
				</Box>
			);
		}

		if (type === 'number') {
			return (
				<Box>
					<FormControl>
						<FormLabel htmlFor={name}>{name}</FormLabel>
						<NumberInput>
							<NumberInputField id={name} placeholder={name} {...register(name)} />
						</NumberInput>
					</FormControl>
				</Box>
			);
		}

		if (type === 'button') {
			return <Button onClick={handleAction}>{label}</Button>;
		}

		return (
			<Box>
				<FormControl>
					<FormLabel htmlFor={name}>{name}</FormLabel>
					<ChakraInput id={name} placeholder={name} {...register(name)} />
				</FormControl>
			</Box>
		);
	}

	return null;
};

export default function TApp() {
	const methods = useForm({
		shouldUnregister: true,
	});
	const [formData, setFormData] = useState(data); // Assuming 'data' is defined somewhere
	const { components } = useGetUIJson();
	console.log('components', components);
	const sortUI = (components: any) =>
		components.map((c: any) => {
			const UIType = Object.keys(c)[0];
			const props = c[UIType];
			console.log('props', props);
			if (UIType === 'UIInput') {
				return <CustomInput key={props.name} {...props} setFormData={setFormData} />;
			}
		});

	return (
		<div className="form-container">
			<FormProvider {...methods}>
				{/* Render your form data inputs here */}
				{/* {formData.map((d) => (
					<Input key={d.name} {...d} setFormData={setFormData} />
				))} */}

				{/* Render dynamic UI components */}
				{sortUI(components)}
			</FormProvider>
		</div>
	);
}
