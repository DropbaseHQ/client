import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { PageLayout } from '@/layout';

const SettingsOption = ({ children, link }: any) => {
	return (
		<Box
			w="full"
			_hover={{
				bg: 'gray.100',
				cursor: 'pointer',
			}}
			p="1"
			as={ReactRouterLink}
			to={`/settings/${link}`}
		>
			{children}
		</Box>
	);
};
const options = [
	{
		name: 'Members',
		link: 'members',
	},
	{
		name: 'Groups',
		link: 'groups',
	},
	{
		name: 'Permissions',
		link: 'permissions',
	},
	{
		name: 'Billing',
		link: 'billing',
	},
];

export const SettingsLayout = ({ children }: PropsWithChildren<any>) => {
	return (
		<Flex h="full">
			<Box flex="1">
				<PageLayout title="Settings">
					<Stack>
						{options.map((option) => (
							<SettingsOption key={option.name} link={option.link}>
								<Text>{option.name}</Text>
							</SettingsOption>
						))}
					</Stack>
				</PageLayout>
			</Box>

			<Box flex="6" w="full" h="full" borderLeft="1px" borderColor="gray.100">
				{children}
			</Box>
		</Flex>
	);
};
