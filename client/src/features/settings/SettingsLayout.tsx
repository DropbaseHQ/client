import { useAtom, useAtomValue } from 'jotai';
import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import { Lock } from 'react-feather';
import { PropsWithChildren, useEffect } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { PageLayout } from '@/layout';
import { workspaceAtom } from '../workspaces';
import { useGetCurrentUser } from '../authorization/hooks/useGetUser';
import { canUseGranularPermissionsAtom } from './atoms';

const SettingsOption = ({
	children,
	link,
	available,
}: {
	children: any;
	link: string;
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
			justifyContent="space-between"
			pointerEvents={available ? 'auto' : 'none'}
		>
			{children}
			{available ? null : <Lock size="16" color="gray" />}
		</Box>
	);
};
const options = [
	{
		name: 'Members',
		link: 'members',
		isGranular: false,
	},
	{
		name: 'Groups',
		link: 'groups',
		isGranular: true,
	},
	{
		name: 'Permissions',
		link: 'permissions',
		isGranular: true,
	},
	{
		name: 'Billing',
		link: 'billing',
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
								available={option.isGranular ? canUse : true}
							>
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
