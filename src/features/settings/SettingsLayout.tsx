import { Box, Stack, Text } from '@chakra-ui/react';
import { Lock, User, Users, Icon as ReactFeatherIcon } from 'react-feather';
import { PropsWithChildren } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { PageLayout } from '@/layout';

const SettingsOption = ({
	children,
	link,
	Icon,
}: {
	children: any;
	link: string;
	Icon: ReactFeatherIcon;
}) => {
	const isSelected = window.location.pathname.includes(link);
	return (
		<Box
			w="full"
			color={isSelected ? 'blue.500' : 'body'}
			p="1"
			as={ReactRouterLink}
			to={`/settings/${link}`}
			display="flex"
			alignItems="center"
		>
			{Icon ? (
				<Box mr="3">
					<Icon size="12" />
				</Box>
			) : null}
			{children}
		</Box>
	);
};
const options = [
	{
		name: 'Members',
		link: 'members',
		icon: User,
	},
	{
		name: 'Groups',
		link: 'groups',
		icon: Users,
	},
	{
		name: 'Permissions',
		link: 'permissions',
		icon: Lock,
	},
];

export const SettingsLayout = ({ children }: PropsWithChildren<any>) => {
	return (
		<Stack direction="row" spacing="0" h="full">
			<Box h="full" overflow="auto" flex="1">
				<PageLayout title="Settings">
					<Stack>
						{options.map((option) => (
							<SettingsOption key={option.name} link={option.link} Icon={option.icon}>
								<Text fontSize="md">{option.name}</Text>
							</SettingsOption>
						))}
					</Stack>
				</PageLayout>
			</Box>

			<Box flex="6" w="full" h="full" borderLeft="1px" borderColor="gray.100">
				{children}
			</Box>
		</Stack>
	);
};
