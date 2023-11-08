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
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

import { useCreateFile, usePageFiles, useSources } from '@/features/app-builder/hooks';
import { useToast } from '@/lib/chakra-ui';
import { FormInput } from '@/components/FormInput';
import { pageAtom, useGetPage } from '@/features/page';
import { generateSequentialName } from '@/utils';

export const NewFile = (props: any) => {
	const toast = useToast();
	const methods = useForm();

	const { pageId } = useParams();

	const { sources } = useSources();
	const { files } = useGetPage(pageId);

	const { pageName, appName } = useAtomValue(pageAtom);

	const { refetch } = usePageFiles({
		pageName: pageName || '',
		appName: appName || '',
	});

	const { isOpen, onToggle, onClose } = useDisclosure({
		onClose: () => {
			methods.reset();
		},
	});

	const mutation = useCreateFile({
		onSuccess: () => {
			toast({
				title: 'File created successfully',
			});
			refetch();
			onClose();
		},
	});

	const currentType = methods.watch('type');

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

	useEffect(() => {
		methods.setValue(
			'name',
			generateSequentialName({
				currentNames: files.map((f) => f.name),
				prefix: 'function',
			}),
		);
	}, [methods, isOpen, files]);

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
						Create a new function
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
											name: 'Python (UI)',
											value: 'ui',
										},
										{
											name: 'Python (Generic)',
											value: 'python',
										},
									]}
									validation={{ required: 'Cannot  be empty' }}
									name="type"
									id="type"
								/>

								{currentType === 'sql' ? (
									<FormInput
										size="sm"
										flex="1"
										maxW="sm"
										type="select"
										options={sources.map((s) => ({ name: s, value: s }))}
										name="source"
										id="source"
									/>
								) : null}
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
