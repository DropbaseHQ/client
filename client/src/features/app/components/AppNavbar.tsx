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
} from '@chakra-ui/react';
import { ArrowLeft, Edit, Eye, EyeOff } from 'react-feather';
import { useEffect, useState } from 'react';

import { Link, useParams } from 'react-router-dom';
import { DropbaseIcon } from '@/components/Logo';
import { useGetWorkspaceApps } from '@/features/app-list/hooks/useGetWorkspaceApps';
import { useUpdateApp } from '@/features/app-list/hooks/useUpdateApp';

export const AppNavbar = ({ isPreview }: any) => {
	const { appId } = useParams();
	const { apps } = useGetWorkspaceApps();

	const [name, setAppName] = useState('');

	const updateMutation = useUpdateApp();

	const app = apps.find((a) => a.id === appId);

	useEffect(() => {
		if (app) {
			setAppName(app?.name);
		}
	}, [app]);

	const handleChange = (e: any) => {
		setAppName(e.target.value);
	};

	const handleReset = () => {
		if (app) setAppName(app?.name);
	};

	const handleUpdate = () => {
		if (app) {
			updateMutation.mutate({
				appId,
				name,
			});
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
										<FormControl>
											<FormLabel>Edit App name</FormLabel>
											<Input
												size="sm"
												placeholder="App name"
												value={name}
												onChange={handleChange}
											/>
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
												isDisabled={app?.name === name || !name}
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
			<Tooltip label={isPreview ? 'App preview' : 'App Studio'}>
				<IconButton
					size="sm"
					variant="ghost"
					colorScheme="blue"
					icon={isPreview ? <EyeOff size="14" /> : <Eye size="14" />}
					aria-label="Preview"
					ml="auto"
					mr="4"
					as={Link}
					to={isPreview ? '../new-editor' : '../new-preview'}
				/>
			</Tooltip>
		</Stack>
	);
};
