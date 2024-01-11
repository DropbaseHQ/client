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
} from '@chakra-ui/react';
import { ArrowLeft, Edit, Eye } from 'react-feather';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DropbaseIcon } from '@/components/Logo';
import { useGetWorkspaceApps } from '@/features/app-list/hooks/useGetWorkspaceApps';
import { useUpdateApp } from '@/features/app-list/hooks/useUpdateApp';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';

export const AppNavbar = ({ isPreview }: any) => {
	const toast = useToast();
	const { appName } = useParams();
	const { apps } = useGetWorkspaceApps();

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

	// const forceSyncMutation = useForceSyncState();

	const app = apps.find((a) => a.name === appName);

	useEffect(() => {
		if (app) {
			setAppName(app?.name);
		}
	}, [app]);

	const nameNotUnique = (newName: any) => {
		return apps.find((a) => {
			return a.name === newName;
		});
	};

	const handleChange = (e: any) => {
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
												onChange={handleChange}
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
