/* eslint-disable  */
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
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
import { useParams } from 'react-router';
import { useMutation } from 'react-query';
import { axios } from '@/lib/axios';
import { useAtom } from 'jotai';
import { selectedRowAtom, userInputAtom } from '@/features/app-builder/atoms/tableContextAtoms';

const runTask = async ({
	appId,
	userInput,
	row,
	action,
}: {
	appId: string;
	userInput: any;
	row: any;
	action: any;
}) => {
	const { data } = await axios.post('/task', {
		app_id: appId,
		user_input: userInput,
		row,
		action,
	});
	return data;
};

export const useRunTask = () => {
	return useMutation(runTask);
};

export const CustomInput = (props: any) => {
	const { name, type, options, depends, depends_value } = props;
	const { watch, register } = useFormContext();
	const dependentValue = watch(depends);

	const [loading, setLoading] = useState(false);

	const getOptions = async () => {
		if (!loading) {
			setLoading(true);
			// const fetchedOptions = await getData(options);

			// setFormData((data) => {
			// 	return data.map((d) => {
			// 		if (d.name === name) {
			// 			return {
			// 				...d,
			// 				...fetchedOptions,
			// 			};
			// 		}

			// 		return d;
			// 	});
			// });
			setLoading(false);
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
						<Select id={name} placeholder={name} {...register(name)}>
							<option>Select {name}</option>
							{options?.map((o: any) => <option key={o}>{o}</option>)}
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

		// if (type === 'button') {
		// 	return <Button onClick={handleAction}>{label}</Button>;
		// }

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

export const CustomButton = (props: any) => {
	const { label, action, post_action, doActions, getValues, getData } = props;
	const runTask = useRunTask();
	const { appId } = useParams();
	const [selectedRow] = useAtom(selectedRowAtom);
	const [userInput] = useAtom(userInputAtom);
	// const
	const handleAction = async () => {
		try {
			await runTask.mutateAsync({
				appId: appId || '',
				userInput: userInput,
				row: formatRowForAction(selectedRow),
				action,
			});
			// reset(resetFields);
			if (post_action) {
				console.log(`Performing post action: ${post_action}`);
				await getData(post_action);
			}
		} catch (e) {
			//
		}
	};

	return (
		<Button onClick={handleAction} marginTop="2">
			{label}
		</Button>
	);
};

const formatRowForAction = (rows: any) => {
	const transformedObject: any = {};
	for (const key in rows) {
		const { folder, table, value } = rows[key];
		/* eslint-disable */
		if (!transformedObject[folder as keyof typeof transformedObject]) {
			transformedObject[folder] = {};
		}
		if (!transformedObject[folder][table]) {
			transformedObject[folder][table] = {};
		}
		transformedObject[folder][table][key.split('-')[1]] = value;
	}
	/* eslint-enable */
	return transformedObject;
};
