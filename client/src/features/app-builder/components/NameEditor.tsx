import {
	Button,
	ButtonGroup,
	FormControl,
	FormErrorMessage,
	FormLabel,
	IconButton,
	Input,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverContent,
	PopoverFooter,
	PopoverTrigger,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Edit } from 'react-feather';

export const NameEditor = ({ value, currentNames, onUpdate, buttonProps, resource }: any) => {
	const [name, setName] = useState(value);

	const [invalidMessage, setInvalidMessage] = useState<string | boolean>(false);

	const handleReset = () => {
		setName(value);
		setInvalidMessage(false);
	};

	useEffect(() => {
		setName(value);
		setInvalidMessage(false);
	}, [value]);

	const nameNotUnique = (newName: any) => {
		return currentNames
			.filter((n: any) => n !== value)
			.find((n: any) => {
				return n === newName;
			});
	};

	const handleChangeAppName = (e: any) => {
		const {
			target: { value: newName },
		} = e;

		setName(newName);

		if (newName !== newName.toLowerCase()) {
			setInvalidMessage('Must be lowercase');
		} else if (nameNotUnique(newName)) {
			setInvalidMessage(`An ${resource} with this name already exists.`);
		} else if (newName.includes(' ')) {
			setInvalidMessage('Name cannot have spaces');
		} else if (newName !== '' && !Number.isNaN(parseInt(newName[0], 10))) {
			setInvalidMessage('Name cannot start with a number');
		} else if (!newName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/g) && newName !== '') {
			setInvalidMessage('Name contains invalid characters');
		} else {
			setInvalidMessage(false);
		}
	};

	const handleUpdate = () => {
		onUpdate(name);
	};

	return (
		<Popover onClose={handleReset} placement="bottom-end" closeOnBlur={false}>
			{({ onClose }) => (
				<>
					<PopoverTrigger>
						<IconButton
							size="xs"
							variant="outline"
							colorScheme="gray"
							icon={<Edit size="12" />}
							aria-label="Edit app"
							{...(buttonProps || {})}
						/>
					</PopoverTrigger>
					<PopoverContent>
						<PopoverArrow />
						<PopoverBody>
							<FormControl isInvalid={Boolean(invalidMessage)}>
								<FormLabel>Edit name</FormLabel>
								<Input
									size="sm"
									placeholder={`Enter ${resource} name`}
									value={name}
									onChange={handleChangeAppName}
								/>

								<FormErrorMessage>{invalidMessage}</FormErrorMessage>
							</FormControl>
						</PopoverBody>
						<PopoverFooter display="flex" alignItems="end">
							<ButtonGroup ml="auto" size="xs">
								<Button onClick={onClose} colorScheme="gray" variant="outline">
									Cancel
								</Button>
								<Button
									isDisabled={value === name || !name || !!invalidMessage}
									colorScheme="gray"
									variant="outline"
									onClick={handleUpdate}
								>
									Update
								</Button>
							</ButtonGroup>
						</PopoverFooter>
					</PopoverContent>
				</>
			)}
		</Popover>
	);
};
