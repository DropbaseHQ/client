import { useParams } from 'react-router-dom';
import {
	Button,
	ButtonGroup,
	IconButton,
	Input,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverFooter,
	PopoverHeader,
	PopoverTrigger,
	useDisclosure,
} from '@chakra-ui/react';
import { Plus } from 'react-feather';
import { useRef } from 'react';

import { useCreateFunction } from '@/features/new-app-builder/hooks';
import { useToast } from '@/lib/chakra-ui';

export const NewFunction = (props: any) => {
	const toast = useToast();
	const { pageId } = useParams();

	const { isOpen, onToggle, onClose } = useDisclosure();

	const inputRef = useRef<any>();

	const mutation = useCreateFunction({
		onSuccess: () => {
			inputRef.current.value = '';
			onClose();
		},
	});

	const handleAddFunction = () => {
		const name = inputRef.current.value;
		if (name.trim()) {
			mutation.mutate({
				pageId,
				name,
			});
		} else {
			toast({
				title: 'Name is required',
				status: 'warning',
			});
		}
	};

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur={false}>
			<PopoverTrigger>
				<IconButton
					aria-label="Add function"
					icon={<Plus size="14" />}
					onClick={onToggle}
					isLoading={mutation.isLoading}
					{...props}
				/>
			</PopoverTrigger>

			<PopoverContent>
				<PopoverHeader pt={4} fontWeight="bold" border="0">
					Create a new Function
				</PopoverHeader>
				<PopoverArrow />
				<PopoverCloseButton />
				<PopoverBody>
					<Input size="sm" ref={inputRef} placeholder="Enter function name" />
				</PopoverBody>
				<PopoverFooter
					border="0"
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					pb={4}
				>
					<ButtonGroup size="sm">
						<Button onClick={onClose} colorScheme="red" variant="outline">
							Cancel
						</Button>
						<Button
							colorScheme="blue"
							isLoading={mutation.isLoading}
							onClick={handleAddFunction}
						>
							Create
						</Button>
					</ButtonGroup>
				</PopoverFooter>
			</PopoverContent>
		</Popover>
	);
};
