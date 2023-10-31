import {
	Button,
	ButtonGroup,
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
import { Plus } from 'react-feather';
import { FormProvider, useForm } from 'react-hook-form';
import { useAtomValue } from 'jotai';

import { useCreateFile, usePageFiles, useSources } from '@/features/app-builder/hooks';
import { useToast } from '@/lib/chakra-ui';
import { FormInput } from '@/components/FormInput';
import { pageAtom } from '@/features/page';
import { useParams } from 'react-router-dom';

export const NewFile = (props: any) => {
	const toast = useToast();
	const methods = useForm();

	const { pageId } = useParams();

	const { sources } = useSources();

	const { pageName, appName } = useAtomValue(pageAtom);

	const { refetch } = usePageFiles({
		pageName: pageName || '',
		appName: appName || '',
	});

	const { isOpen, onToggle, onClose } = useDisclosure();

	const mutation = useCreateFile({
		onSuccess: () => {
			toast({
				title: 'File created successfully',
			});
			refetch();
			methods.reset();
			onClose();
		},
	});

	const onSubmit = ({ type, name, source }: any) => {
		mutation.mutate({
			pageId,
			pageName,
			appName,
			fileName: name,
			type,
			source,
		});
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

			<Portal>
				<PopoverContent>
					<PopoverHeader pt={4} fontWeight="bold" border="0">
						Create a new file
					</PopoverHeader>
					<PopoverArrow />
					<PopoverCloseButton />
					<FormProvider {...methods}>
						<form onSubmit={methods.handleSubmit(onSubmit)}>
							<PopoverBody>
								<FormInput
									type="text"
									validation={{ required: 'Cannot  be empty' }}
									name="name"
									id="name"
								/>
								<FormInput
									type="select"
									options={[
										{
											name: 'SQL (Data Fetcher)',
											value: 'sql',
										},
										{
											name: 'Python (Data Fetcher)',
											value: 'data_fetcher',
										},
										{
											name: 'Python (UI/Generic)',
											value: 'python',
										},
									]}
									validation={{ required: 'Cannot  be empty' }}
									name="type"
									id="type"
								/>

								<FormInput
									size="sm"
									flex="1"
									maxW="sm"
									type="select"
									options={sources.map((s) => ({ name: s, value: s }))}
									name="source"
									id="source"
								/>
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
										type="submit"
										isLoading={mutation.isLoading}
									>
										Create
									</Button>
								</ButtonGroup>
							</PopoverFooter>
						</form>
					</FormProvider>
				</PopoverContent>
			</Portal>
		</Popover>
	);
};
