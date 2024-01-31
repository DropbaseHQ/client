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
import { invalidResourceName } from '@/utils';

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

	const handleChangeAppName = (e: any) => {
		const newName = e.target.value;

		setInvalidMessage(invalidResourceName(value, newName, currentNames));
		setName(newName);
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
