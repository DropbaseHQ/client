import { Box, Stack, Heading, Grid, Flex, Text } from '@chakra-ui/react';
import { AppGraphic } from './AppGraphic';
import { useGetWorkspaceApps, App as AppType } from './hooks/useGetWorkspaceApps';
import { useGetAppPages } from './hooks/useGetAppPages';
import { useNavigate } from 'react-router-dom';
const AppCard = ({ app }: { app: AppType }) => {
	// Will need to pass app in here but for now we only have one app (backend spits out the first app)
	const { pages } = useGetAppPages();

	const navigate = useNavigate();
	const handleClick = () => {
		navigate(`/apps/${app.id}/${pages[0].id}`);
	};
	return (
		<Flex
			rounded="md"
			borderWidth="1px"
			borderColor="gray.200"
			borderRadius="md"
			alignItems="center"
			justifyContent="space-around"
			cursor="pointer"
			p="2"
			_hover={{
				bg: 'gray.100',
			}}
			onClick={handleClick}
		>
			<Flex flex="1" alignItems="center" justifyContent="cente">
				<AppGraphic />
			</Flex>
			<Box flex="2">
				<Heading size="xs">{app?.name}</Heading>
				<Text>Lorem ipsum</Text>
			</Box>
		</Flex>
	);
};

export const AppList = () => {
	// Will need to pass workspace in here but for now we only have one workspace (backend spits out the first workspace)
	const { apps } = useGetWorkspaceApps();
	return (
		<Stack>
			{/* <AppBuilderNavbar /> */}
			<Box h="full" p="4">
				<Heading size="md" mb="8">
					Your apps
				</Heading>
				<Grid templateColumns="repeat(3, 1fr)" gap={6}>
					{apps.map((app) => (
						<AppCard key={app.id} app={app} />
					))}
				</Grid>
			</Box>
		</Stack>
	);
};
