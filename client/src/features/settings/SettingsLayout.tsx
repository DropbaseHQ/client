import { useAtom, useAtomValue } from 'jotai';
import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import { Lock, User, Users, Code, Icon as ReactFeatherIcon } from 'react-feather';
import { PropsWithChildren, useEffect } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { PageLayout } from '@/layout';
import { workspaceAtom } from '../workspaces';
import { useGetCurrentUser } from '../authorization/hooks/useGetUser';
import { canUseGranularPermissionsAtom } from './atoms';

const SettingsOption = ({
	children,
	link,
	Icon,
	available,
}: {
	children: any;
	link: string;
	Icon: ReactFeatherIcon;
	available: boolean;
}) => {
	const isSelected = window.location.pathname.includes(link);
	return (
		<Box
			w="full"
			_hover={available ? { bg: 'gray.100', cursor: 'pointer' } : { cursor: 'not-allowed' }}
			color={isSelected ? 'blue.500' : 'body'}
			p="1"
			as={ReactRouterLink}
			to={`/settings/${link}`}
			display="flex"
			alignItems="center"
			pointerEvents={available ? 'auto' : 'none'}
		>
			{Icon ? (
				<Box mr="3">
					<Icon size="12" />
				</Box>
			) : null}
			{children}
			{available ? null : (
				<Box ml="2">
					<Lock size="10" color="gray" />
				</Box>
			)}
		</Box>
	);
};
const options = [
	{
		name: 'Members',
		link: 'members',
		icon: User,
		isGranular: false,
	},
	{
		name: 'Groups',
		link: 'groups',
		icon: Users,
		isGranular: true,
	},
	{
		name: 'Permissions',
		link: 'permissions',
		icon: Lock,
		isGranular: true,
	},
	{
		name: 'Developer',
		link: 'developer',
		icon: Code,
		isGranular: false,
	},
];

export const SettingsLayout = ({ children }: PropsWithChildren<any>) => {
	const { user: userInfo } = useGetCurrentUser();
	const { in_trial: inTrial } = useAtomValue(workspaceAtom);
	const [canUse, setCanUse] = useAtom(canUseGranularPermissionsAtom);

	useEffect(() => {
		setCanUse(inTrial || userInfo?.email?.endsWith('dropbase.io'));
	}, [inTrial, userInfo?.email, setCanUse]);
	return (
		<Flex h="full">
			<Box flex="1">
				<PageLayout title="Settings">
					<Stack>
						{options.map((option) => (
							<SettingsOption
								key={option.name}
								link={option.link}
								Icon={option.icon}
								available={option.isGranular ? canUse : true}
							>
								<Text fontSize="md">{option.name}</Text>
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
