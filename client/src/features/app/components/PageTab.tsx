import {
	Box,
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
	Tab,
	Flex,
	useDisclosure,
} from '@chakra-ui/react';
import { MoreVertical } from 'react-feather';
import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/lib/chakra-ui';
import { useDeletePage, useRenamePage } from '@/features/page';
import { getErrorMessage } from '@/utils';

export const PageTab = (props: any) => {
	const { isPreview, index, tabIndex, page, pages } = props;

	const { isOpen: isRenameOpen, onOpen: onRenameOpen, onClose: onRenameClose } = useDisclosure();
	const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

	const { appName, pageName } = useParams();
	const [pageNameEdit, setPageNameEdit] = useState('');
	const toast = useToast();

	const renamePageMutation = useRenamePage();
	const deletePageMutation = useDeletePage();

	const navigate = useNavigate();
	const pageLink = `/apps/${appName}/${page?.name}`;

	const handleRenameOpen = () => {
		onDeleteClose();
		onRenameOpen();
		setPageNameEdit(page.name);
	};

	const handleDeleteOpen = () => {
		onRenameClose();
		onDeleteOpen();
	};

	const handleResetPage = () => {
		if (pageName) setPageNameEdit(pageName);
		onRenameClose();
	};
	const pageNameNotUnique = (newName: any) => {
		return pages
			.filter((xPage: any) => xPage.name !== pageName)
			.find((a: any) => {
				return a.name === newName;
			});
	};
	const handleChangePageName = (e: any) => {
		setPageNameEdit(e.target.value);
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
	const handleDeletePage = () => {
		if (appName && pageName) {
			deletePageMutation.mutate(
				{
					appName,
					pageName,
				},
				{
					onSuccess: () => {
						toast({
							status: 'success',
							title: 'Page deleted',
						});
						const firstDifferentPage = pages.find(
							(xPage: any) => xPage.name !== pageName,
						);
						if (isPreview) {
							navigate(`../${firstDifferentPage.name}`, { relative: 'path' });
						} else {
							navigate(`../../${firstDifferentPage.name}/studio`, {
								relative: 'path',
							});
						}
					},
					onError: (error: any) => {
						toast({
							status: 'error',
							title: 'Failed to delete page',
							description: getErrorMessage(error),
						});
					},
				},
			);
		}
	};

	return (
		<Tab
			key={page.name}
			display="flex"
			alignItems="center"
			as={Link}
			to={isPreview ? pageLink : `${pageLink}/studio`}
			px="3"
			py="1"
			_selected={{
				color: 'blue.500',
			}}
		>
			<Flex align="center" justifyContent="center" h="24px">
				<Box fontWeight="semibold">{page.name}</Box>
				{!isPreview ? (
					<Menu
						closeOnSelect={false}
						onClose={() => {
							onRenameClose();
							onDeleteClose();
						}}
					>
						<MenuButton
							ml="0.5"
							color="gray.400"
							_hover={{
								color: 'gray.600',
							}}
							visibility={tabIndex === index ? 'visible' : 'hidden'}
							disabled={tabIndex !== index}
						>
							<Box>
								<MoreVertical size="14" />
							</Box>
						</MenuButton>
						<MenuList color="black">
							<Popover
								placement="right"
								onClose={onRenameClose}
								isOpen={isRenameOpen}
								onOpen={handleRenameOpen}
							>
								<PopoverTrigger>
									<MenuItem data-db-id="rename-page">Edit</MenuItem>
								</PopoverTrigger>
								<PopoverContent
									textColor="black"
									color="black"
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									onBlur={(e) => {
										if (e.relatedTarget?.id.includes('menu-list')) {
											e.preventDefault();
										}
									}}
								>
									<PopoverArrow />
									<PopoverBody>
										<FormControl isInvalid={pageNameNotUnique(pageNameEdit)}>
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
												colorScheme="gray"
												textColor="gray"
												variant="outline"
											>
												Cancel
											</Button>
											<Button
												isDisabled={
													pageNameEdit === page.name ||
													!page.name ||
													pageNameNotUnique(pageNameEdit)
												}
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
							<Popover
								placement="right"
								closeOnBlur={false}
								onClose={onDeleteClose}
								isOpen={isDeleteOpen}
								onOpen={handleDeleteOpen}
							>
								<PopoverTrigger>
									<MenuItem id="delete-page">Delete</MenuItem>
								</PopoverTrigger>
								<PopoverContent
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
								>
									<PopoverArrow />
									<PopoverBody>
										Are you sure you want to delete this page?
									</PopoverBody>
									<PopoverFooter display="flex" alignItems="end">
										<ButtonGroup ml="auto" size="sm">
											<Button
												colorScheme="gray"
												textColor="gray"
												variant="outline"
												onClick={onDeleteClose}
											>
												Cancel
											</Button>
											<Button
												colorScheme="red"
												isLoading={deletePageMutation.isLoading}
												onClick={handleDeletePage}
											>
												Delete
											</Button>
										</ButtonGroup>
									</PopoverFooter>
								</PopoverContent>
							</Popover>
						</MenuList>
					</Menu>
				) : null}
			</Flex>
		</Tab>
	);
};
