import {
	HStack,
	Flex,
	IconButton,
	Stack,
	Tooltip,
	Popover,
	PopoverTrigger,
	PopoverContent,
	PopoverArrow,
	PopoverBody,
	Input,
	PopoverFooter,
	ButtonGroup,
	Button,
	FormControl,
	FormLabel,
	FormErrorMessage,
	TabList,
	Tabs,
} from '@chakra-ui/react';
import { ArrowLeft, Edit, Eye, Plus } from 'react-feather';
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { DropbaseIcon } from '@/components/Logo';
import { useGetWorkspaceApps } from '@/features/app-list/hooks/useGetWorkspaceApps';
import { useUpdateApp } from '@/features/app-list/hooks/useUpdateApp';
import { useToast } from '@/lib/chakra-ui';
import { useCreatePage } from '@/features/page';
import { getErrorMessage, generateSequentialName } from '@/utils';
import { PageTab } from './PageTab';
import { LabelContainer } from '@/components/LabelContainer';
import { PromptButton } from '@/features/ai';

export const AppNavbar = ({ isPreview }: any) => {
	const toast = useToast();
	const navigate = useNavigate();
	const { appName, pageName } = useParams();
	const { apps } = useGetWorkspaceApps();
	const [tabIndex, setTabIndex] = useState(0);

	const [label, setAppLabel] = useState('');

	const [invalidMessage] = useState<string | boolean>(false);

	const updateMutation = useUpdateApp({
		onError: (error: any) => {
			toast({
				status: 'error',
				title: 'Failed to update app',
				description: getErrorMessage(error),
			});
		},
	});
	const createPageMutation = useCreatePage();

	const app = apps.find((a) => a.name === appName);
	const currentPageIndex = app?.pages.findIndex((p: any) => p.name === pageName);

	useEffect(() => {
		if (app) {
			setAppLabel(app?.label);
		}
		if (currentPageIndex !== undefined) {
			setTabIndex(currentPageIndex);
		}
	}, [app, pageName, currentPageIndex]);

	const handleTabsChange = (index: any) => {
		setTabIndex(index);
		(document.activeElement as HTMLElement)?.blur();
	};

	const handleChangeAppLabel = (e: any) => {
		const newLabel = e.target.value;
		setAppLabel(newLabel);
	};

	const handleReset = () => {
		if (app) setAppLabel(app?.label);
	};

	const handleUpdate = () => {
		if (app) {
			updateMutation.mutate({
				appName,
				newLabel: label,
			});
		}
	};

	const handleCreatePage = () => {
		if (appName) {
			const { name: newPageName, label: newPageLabel } = generateSequentialName({
				currentNames: app?.pages.map((p: any) => p.name) || [],
				prefix: 'page',
			});

			createPageMutation.mutate(
				{
					appName,
					pageName: newPageName,
					pageLabel: newPageLabel,
				},
				{
					onSuccess: (_, variables: any) => {
						toast({
							status: 'success',
							title: 'Page created',
						});
						if (isPreview) {
							navigate(`../${variables.pageName}`, { relative: 'path' });
						} else {
							navigate(`../../${variables.pageName}/studio`, { relative: 'path' });
						}
					},
					onError: (error: any) => {
						toast({
							status: 'error',
							title: 'Failed to create page',
							description: getErrorMessage(error),
						});
					},
				},
			);
		}
	};

	const methods = useForm();

	return (
		<Stack
			alignItems="center"
			h="12"
			borderBottomWidth="1px"
			spacing="1"
			direction="row"
			bg="white"
		>
			<HStack spacing="1">
				<DropbaseIcon
					icon={<ArrowLeft size="16" />}
					w="11"
					h="12"
					colorScheme="gray"
					overflow="hidden"
					as={Link}
					to="/apps"
					borderRadius="0"
					variant="ghost"
				/>
			</HStack>

			<Stack alignItems="center" direction="row">
				<LabelContainer>
					<LabelContainer.Label> {app?.label}</LabelContainer.Label>
					{isPreview ? null : <LabelContainer.Code>{app?.name}</LabelContainer.Code>}
				</LabelContainer>

				{isPreview ? null : (
					<Popover onClose={handleReset} placement="bottom-end" closeOnBlur={false}>
						{({ onClose }) => (
							<>
								<PopoverTrigger>
									<IconButton
										isLoading={updateMutation.isLoading}
										size="sm"
										variant="ghost"
										colorScheme="gray"
										icon={<Edit size="14" />}
										aria-label="Edit app"
									/>
								</PopoverTrigger>
								<PopoverContent>
									<form onSubmit={methods.handleSubmit(handleUpdate)}>
										<FormControl isInvalid={Boolean(invalidMessage)}>
											<PopoverArrow />
											<PopoverBody>
												<FormLabel>Edit App Label</FormLabel>
												<Input
													size="sm"
													placeholder="App Label"
													value={label}
													onChange={handleChangeAppLabel}
												/>

												<FormErrorMessage>
													{invalidMessage}
												</FormErrorMessage>
											</PopoverBody>
											<PopoverFooter display="flex" alignItems="end">
												<ButtonGroup ml="auto" size="sm">
													<Button
														onClick={onClose}
														colorScheme="red"
														variant="outline"
													>
														Cancel
													</Button>
													<Button
														isDisabled={
															app?.label === label ||
															!label ||
															Boolean(invalidMessage)
														}
														colorScheme="blue"
														type="submit"
													>
														Update
													</Button>
												</ButtonGroup>
											</PopoverFooter>
										</FormControl>
									</form>
								</PopoverContent>
							</>
						)}
					</Popover>
				)}
			</Stack>
			<Flex alignItems="center" h="100%" justifyContent="center">
				<Tabs
					ml="6"
					variant="unstyled"
					size="sm"
					index={tabIndex}
					onChange={handleTabsChange}
				>
					<TabList display="flex" alignItems="center">
						{app?.pages.map((page: any, index: number) => {
							return (
								<PageTab
									key={page.name}
									{...{ isPreview, index, tabIndex, page, pages: app?.pages }}
								/>
							);
						})}
						{!isPreview && (
							<IconButton
								size="sm"
								aria-label="Create page"
								onClick={handleCreatePage}
								variant="ghost"
								isLoading={createPageMutation.isLoading}
								icon={<Plus size="14" />}
							/>
						)}
					</TabList>
				</Tabs>
			</Flex>

			<Stack direction="row" spacing="2" ml="auto">
				{!isPreview ? <PromptButton /> : null}

				<Tooltip label={isPreview ? 'App Studio' : 'App Preview'}>
					<Button
						size="sm"
						variant="secondary"
						colorScheme="blue"
						leftIcon={isPreview ? <Edit size="14" /> : <Eye size="14" />}
						aria-label="Preview"
						ml="auto"
						mr="4"
						as={Link}
						data-cy="preview-toggle"
						to={isPreview ? 'studio' : '../'}
					>
						{isPreview ? 'Edit' : 'Preview'}
					</Button>
				</Tooltip>
			</Stack>
		</Stack>
	);
};
