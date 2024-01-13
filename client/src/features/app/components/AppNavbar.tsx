import {
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
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
} from '@chakra-ui/react';
import { ArrowLeft, Edit, Eye, Plus } from 'react-feather';
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { DropbaseIcon } from '@/components/Logo';
import { useGetWorkspaceApps } from '@/features/app-list/hooks/useGetWorkspaceApps';
import { useUpdateApp } from '@/features/app-list/hooks/useUpdateApp';
import { useToast } from '@/lib/chakra-ui';
import { useCreatePage, useRenamePage } from '@/features/page';
import { getErrorMessage, generateSequentialName } from '@/utils';

export const AppNavbar = ({ isPreview }: any) => {
	const toast = useToast();
	const navigate = useNavigate();
	const { appName, pageName } = useParams();
	const { apps } = useGetWorkspaceApps();

	const [name, setAppName] = useState('');
	const [pageNameEdit, setPageNameEdit] = useState('');
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
	const renamePageMutation = useRenamePage();

	const app = apps.find((a) => a.name === appName);

	useEffect(() => {
		if (app) {
			setAppName(app?.name);
		}
		if (pageName) {
			setPageNameEdit(pageName);
		}
	}, [app, pageName]);

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
	const handleChangePageName = (e: any) => {
		const pageNameNotUnique = (newName: any) => {
			return app?.pages.find((a: any) => {
				return a.name === newName;
			});
		};
		setPageNameEdit(e.target.value);
		if (pageNameNotUnique(e.target.value)) {
			setIsValid(false);
		} else {
			setIsValid(true);
		}
	};
	const handleReset = () => {
		if (app) setAppName(app?.name);
	};
	const handleResetPage = () => {
		if (pageName) setPageNameEdit(pageName);
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
	const handleRenamePage = () => {
		if (appName && pageName) {
			renamePageMutation.mutate(
				{
					appName,
					pageName,
					newPageName: pageNameEdit,
				},
				{
					onSuccess: (_, variables: any) => {
						toast({
							status: 'success',
							title: 'Page renamed',
						});
						if (isPreview) {
							navigate(`../${variables.newPageName}`, { relative: 'path' });
						} else {
							navigate(`../../${variables.newPageName}/studio`, { relative: 'path' });
						}
					},
					onError: (error: any) => {
						toast({
							status: 'error',
							title: 'Failed to rename page',
							description: getErrorMessage(error),
						});
					},
				},
			);
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
				<Text fontWeight="semibold" fontSize="lg">
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

			<Stack direction="row" spacing="2" ml="auto">
				<ButtonGroup variant="outline" isAttached>
					<Menu>
						<MenuButton size="sm" variant="secondary" colorScheme="blue" as={Button}>
							{pageName}
						</MenuButton>
						<MenuList>
							{app?.pages.map((page: any) => {
								const pageLink = `/apps/${appName}/${page.name}`;
								return (
									<MenuItem
										key={page.name}
										as={Link}
										to={isPreview ? pageLink : `${pageLink}/studio`}
									>
										{page.name}
									</MenuItem>
								);
							})}
						</MenuList>

						{!isPreview && (
							<Popover>
								<PopoverTrigger>
									<IconButton
										size="sm"
										variant="secondary"
										aria-label="Edit Page Name"
										icon={<Edit size="14" />}
									/>
								</PopoverTrigger>
								<PopoverContent>
									<PopoverArrow />
									<PopoverBody>
										<FormControl isInvalid={!isValid}>
											<FormLabel>Edit Page name</FormLabel>
											<Input
												size="sm"
												placeholder="Page name"
												value={pageNameEdit}
												onChange={handleChangePageName}
											/>

											<FormErrorMessage>
												A page with this name already exists.
											</FormErrorMessage>
										</FormControl>
									</PopoverBody>
									<PopoverFooter display="flex" alignItems="end">
										<ButtonGroup ml="auto" size="sm">
											<Button
												onClick={handleResetPage}
												colorScheme="red"
												variant="outline"
											>
												Cancel
											</Button>
											<Button
												isDisabled={pageName === name || !name || !isValid}
												colorScheme="blue"
												onClick={handleRenamePage}
												isLoading={renamePageMutation.isLoading}
											>
												Update
											</Button>
										</ButtonGroup>
									</PopoverFooter>
								</PopoverContent>
							</Popover>
						)}
						<IconButton
							size="sm"
							variant="secondary"
							aria-label="Add Page"
							icon={<Plus size="14" />}
							onClick={handleCreatePage}
							isLoading={createPageMutation.isLoading}
						/>
					</Menu>
				</ButtonGroup>

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
