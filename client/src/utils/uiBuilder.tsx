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
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
	userInputAtom,
	selectedRowAtom,
	runResultAtom,
} from '@/features/app-builder/atoms/tableContextAtoms';
import { useRunFunction } from '@/features/app-builder/hooks/useRunFunction';

const checkAllRulesPass = ({ formValues, rules }: any) => {
	if (!rules || rules?.length === 0) {
		return true;
	}
	const invalidRule = rules.find((r: any) => {
		const fieldValue = get(formValues, r.name);
		switch (r.operator) {
			case 'equals': {
				return r.value !== fieldValue;
			}
			case 'gt': {
				return r.value >= fieldValue;
			}
			case 'gte': {
				return r.value > fieldValue;
			}
			case 'lt': {
				return r.value <= fieldValue;
			}
			case 'lte': {
				return r.value <= fieldValue;
			}
			case 'exists': {
				return !(r.name in formValues);
			}
			default:
				return false;
		}
	});
	return !invalidRule;
};

export const CustomInput = (props: any) => {
	const {
		name,
		type,
		options,
		display_rules: displayRules,
		on_change_rules: onChangeRules,
		on_change: onChange,
	} = props;

	const setRunResult = useSetAtom(runResultAtom);
	const [userInput, setUserInput] = useAtom(userInputAtom);

	const runTaskMutation = useRunFunction({
		onSuccess: (response: any) => {
			if (typeof response.result !== 'string') {
				response.result = JSON.stringify(response.result);
			}
			setRunResult(response);
		},
	});
	const [selectedRow] = useAtom(selectedRowAtom);

	const { pageId } = useParams();

	useEffect(() => {
		if (name) {
			setUserInput((i) => ({
				...i,
				[name]: '',
			}));
		}

		return () => {
			setUserInput((i) => {
				const inputs = { ...i };
				delete inputs[name as keyof typeof inputs];

				setUserInput(inputs);
			});
		};
	}, [setUserInput, name, type]);

	const handleChange = async (newValue: any) => {
		const newInput = {
			...userInput,
			[name]: newValue,
		};
		setUserInput(newInput);

		if (
			onChange &&
			checkAllRulesPass({
				formValues: newInput,
				rules: onChangeRules,
			})
		) {
			await runTaskMutation.mutateAsync({
				pageId: pageId || '',
				userInput: newInput,
				row: selectedRow,
				functionCall: onChange,
				callType: 'task',
			});
		}
	};

	if (
		(displayRules &&
			checkAllRulesPass({
				formValues: userInput,
				rules: displayRules,
			})) ||
		!displayRules
	) {
		if (type === 'select') {
			if (typeof options === 'string') {
				return null;
			}
			return (
				<Box>
					<FormControl>
						<FormLabel htmlFor={name}>{name}</FormLabel>
						<Select
							id={name}
							placeholder={`Select ${name}`}
							onChange={(e) => {
								handleChange(e.target.value);
							}}
						>
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
						<NumberInput
							onChange={(_, value) => {
								handleChange(value);
							}}
						>
							<NumberInputField id={name} placeholder={name} />
						</NumberInput>
					</FormControl>
				</Box>
			);
		}

		return (
			<Box>
				<FormControl>
					<FormLabel htmlFor={name}>{name}</FormLabel>
					<ChakraInput
						id={name}
						placeholder={name}
						onChange={(e) => {
							handleChange(e.target.value);
						}}
					/>
				</FormControl>
			</Box>
		);
	}

	return null;
};

export const CustomButton = (props: any) => {
	const { label, action, post_action: postAction, getData } = props;
	const setRunResult = useSetAtom(runResultAtom);
	const runTaskMutation = useRunFunction({
		onSuccess: (response: any) => {
			if (typeof response.result !== 'string') {
				response.result = JSON.stringify(response.result);
			}
			setRunResult(response);
		},
	});
	const { pageId } = useParams();
	const [selectedRow] = useAtom(selectedRowAtom);
	const [userInput] = useAtom(userInputAtom);

	const handleAction = async () => {
		try {
			await runTaskMutation.mutateAsync({
				pageId: pageId || '',
				userInput,
				row: selectedRow,
				functionCall: action,
				callType: 'task',
			});

			if (postAction) {
				console.log(`Performing post action: ${postAction}`);
				await getData(postAction);
			}
		} catch (e) {
			//
		}
	};

	return (
		<Button isLoading={runTaskMutation.isLoading} onClick={handleAction} marginTop="2">
			{label}
		</Button>
	);
};
