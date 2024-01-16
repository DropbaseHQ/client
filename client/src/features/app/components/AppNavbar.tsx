import {
	Flex,
	Text,
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
	Tab,
	Tabs,
} from '@chakra-ui/react';
import { ArrowLeft, Edit, Eye, Plus } from 'react-feather';
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { DropbaseIcon } from '@/components/Logo';
import { useGetWorkspaceApps } from '@/features/app-list/hooks/useGetWorkspaceApps';
import { useUpdateApp } from '@/features/app-list/hooks/useUpdateApp';
import { useToast } from '@/lib/chakra-ui';
import { useCreatePage } from '@/features/page';
import { getErrorMessage, generateSequentialName } from '@/utils';
import { PageTab } from './PageTab';

export const AppNavbar = ({ isPreview }: any) => {
	const toast = useToast();
	const navigate = useNavigate();
	const { appName, pageName } = useParams();
	const { apps } = useGetWorkspaceApps();
	const [tabIndex, setTabIndex] = useState(0);

	const [name, setAppName] = useState('');
	const [isValid, setIsValid] = useState(true);
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
			setAppName(app?.name);
		}
		if (currentPageIndex !== undefined) {
			setTabIndex(currentPageIndex);
		}
	}, [app, pageName, currentPageIndex]);

	const handleTabsChange = (index: any) => {
		setTabIndex(index);
		(document.activeElement as HTMLElement)?.blur();
	};

	const nameNotUnique = (newName: any) => {
		return apps.find((a) => {
			return a.name === newName;
		});
	};

	const handleChangeAppName = (e: any) => {
		setAppName(e.target.value);
		if (nameNotUnique(e.target.value)) {
			setIsValid(false);
		} else {
			setIsValid(true);
		}
	};

	const handleReset = () => {
		if (app) setAppName(app?.name);
	};

	const handleUpdate = () => {
		if (app) {
			updateMutation.mutate({
				// FIXME: fix appId
				// appId,
				oldName: app.name,
				newName: name,
			});
		}
	};

	const handleCreatePage = () => {
		if (appName) {
			createPageMutation.mutate(
				{
					appName,
					pageName: generateSequentialName({
						currentNames: app?.pages.map((p: any) => p.name) || [],
						prefix: 'page',
					}),
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

	return (
		<Stack
			alignItems="center"
			h="12"
			borderBottomWidth="1px"
			spacing="1"
			direction="row"
			bg="white"
		>
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
			<Stack alignItems="center" direction="row">
				<Text fontWeight="semibold" fontSize="xl">
					{app?.name}
				</Text>
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
									<PopoverArrow />
									<PopoverBody>
										<FormControl isInvalid={!isValid}>
											<FormLabel>Edit App name</FormLabel>
											<Input
												size="sm"
												placeholder="App name"
												value={name}
												onChange={handleChangeAppName}
											/>

											<FormErrorMessage>
												An app with this name already exists.
											</FormErrorMessage>
										</FormControl>
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
												isDisabled={app?.name === name || !name || !isValid}
												colorScheme="blue"
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
				)}
			</Stack>
			<Flex alignItems="center" h="100%" justifyContent="center">
				<Tabs
					ml="12"
					variant="soft-rounded"
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
							<Tab
								tabIndex={-1}
								as={IconButton}
								onClick={handleCreatePage}
								variant="ghost"
								icon={<Plus size="14" />}
							/>
						)}
					</TabList>
				</Tabs>
			</Flex>

			<Stack direction="row" spacing="2" ml="auto">
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
						to={isPreview ? 'studio' : '../'}
					>
						{isPreview ? 'Edit' : 'Preview'}
					</Button>
				</Tooltip>
			</Stack>
		</Stack>
	);
};
