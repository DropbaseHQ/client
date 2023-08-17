/* eslint-disable  */
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
import get from 'lodash/get';

const checkRules = ({ formValues, rules }: any) => {
	const invalidRule = rules.find((r: any) => {
		const fieldValue = get(formValues, r.name);

		switch (r.operator) {
			case 'equals': {
				return r.value === fieldValue;
			}
			case 'gt': {
				return r.value < fieldValue;
			}

			case 'lt': {
				return r.value > fieldValue;
			}
			case 'exists': {
				return r.name in formValues;
			}
			default:
				return false;
		}
	});

	return !!invalidRule;
};

export const CustomInput = (props: any) => {
	const { name, type, options, depends, rules } = props;
	const { watch, register, getValues } = useFormContext();

	watch();

	if (
		(depends &&
			rules &&
			checkRules({
				formValues: getValues(),
				rules,
			})) ||
		!depends
	) {
		if (type === 'select') {
			if (typeof options === 'string') {
				return null;
			}
			return (
				<Box>
					<FormControl>
						<FormLabel htmlFor={name}>{name}</FormLabel>
						<Select id={name} placeholder={`Select ${name}`} {...register(name)}>
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
				row: selectedRow,
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
