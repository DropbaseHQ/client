import {
	Button,
	ButtonGroup,
	FormControl,
	FormErrorMessage,
	FormLabel,
	IconButton,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverFooter,
	PopoverHeader,
	PopoverTrigger,
	Portal,
	useDisclosure,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

import { useAtomValue } from 'jotai';

import { Edit } from 'react-feather';
import { useEffect, useState } from 'react';

import { useToast } from '@/lib/chakra-ui';
import { useUpdateFile } from '@/features/app-builder/hooks';
import { useGetPage } from '@/features/page';
import { pageAtom } from '@/features/page';
import { InputRenderer } from '@/components/FormInput';

export const EditFile = ({ file }: any) => {
	const toast = useToast();
	const { appName, pageName } = useAtomValue(pageAtom);
	const { pageId } = useParams();

	const { isOpen, onToggle, onClose } = useDisclosure({});
	const { files } = useGetPage(pageId);

	const [fileName, setFileName] = useState('');

	const mutation = useUpdateFile({
		onSuccess: () => {
			onClose();
			toast({
				status: 'success',
				title: 'File Updated',
			});
		},
	});

	const onSubmit = (e: any) => {
		e?.preventDefault();
		const oldFileName = files.find((f: any) => f.id === file.id)?.name;
		mutation.mutate({
			pageName,
			appName,
			fileName: oldFileName,
			newFileName: fileName,
			fileType: file.type,
			pageId,
		});
	};

	useEffect(() => {
		if (file?.name) {
			setFileName(file.name);
		}
	}, [file]);

	return (
		<Popover isOpen={isOpen} onClose={onClose} placement="bottom" closeOnBlur={false}>
			<PopoverTrigger>
				<IconButton
					aria-label="Update file"
					icon={<Edit size="14" />}
					onClick={onToggle}
					isLoading={mutation.isLoading}
					size="xs"
					borderRadius="sm"
					minW={6}
					h={6}
					bg="whiteAlpha.400"
					p={0}
				/>
			</PopoverTrigger>

			<Portal>
				<PopoverContent>
					<PopoverHeader pt={4} fontWeight="bold" border="0">
						Edit File
					</PopoverHeader>
					<PopoverArrow />
					<PopoverCloseButton />
					<form onSubmit={onSubmit}>
						<PopoverBody>
							<FormControl isInvalid={!fileName}>
								<FormLabel>File Name</FormLabel>

								<InputRenderer
									size="sm"
									flex="1"
									placeholder="File name"
									value={fileName}
									onChange={(newValue: any) => {
										setFileName(newValue);
									}}
								/>
								<FormErrorMessage>File name required</FormErrorMessage>
							</FormControl>
						</PopoverBody>
						<PopoverFooter
							border="0"
							display="flex"
							justifyContent="space-between"
							pb={4}
						>
							<ButtonGroup ml="auto" size="sm">
								<Button onClick={onClose} colorScheme="gray" variant="ghost">
									Cancel
								</Button>
								<Button type="submit" isLoading={mutation.isLoading}>
									Update
								</Button>
							</ButtonGroup>
						</PopoverFooter>
					</form>
				</PopoverContent>
			</Portal>
		</Popover>
	);
};
