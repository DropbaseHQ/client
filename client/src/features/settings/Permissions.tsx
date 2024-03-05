import { useState } from 'react';
import { Flex, Box, Text, HStack } from '@chakra-ui/react';
import { User, Users, Layout, Icon as ReactFeatherIcon } from 'react-feather';
import { GroupPermissions } from './components/Permissions/GroupPermissions';
import { MemberPermissions } from './components/Permissions/MemberPermissions';
import { AppPermissions } from './components/Permissions/AppPermissions';

const PermissionsTab = ({
	name,
	value,
	onClick,
	isSelected,
	Icon,
}: {
	name: string;
	value: string;
	onClick: (value: string) => void;
	isSelected: boolean;
	Icon?: ReactFeatherIcon;
}) => {
	return (
		<Box
			_hover={{
				bgColor: 'gray.100',
				cursor: 'pointer',
			}}
			bgColor={isSelected ? 'gray.100' : ''}
			p="3"
			display="flex"
			alignItems="center"
			onClick={() => onClick(value)}
		>
			<Box mr="3">{Icon ? <Icon size="16" color="gray" /> : null}</Box>
			{name}
		</Box>
	);
};

export const Permissions = () => {
	const [mode, setMode] = useState('groups');
	const getPermissionsLayout = () => {
		if (mode === 'groups') {
			return <GroupPermissions />;
		}
		if (mode === 'members') {
			return <MemberPermissions />;
		}
		if (mode === 'apps') {
			return <AppPermissions />;
		}

		return null;
	};
	return (
		<Flex direction="column" h="100%" w="full" border="1px" borderColor="gray.100">
			<Text pt="6" pl="6" fontWeight="bold" fontSize="xl">
				Permissions
			</Text>
			<Flex pl="2" mt="4" w="full" border="1px" borderColor="gray.100">
				<HStack spacing="10">
					<PermissionsTab
						name="Groups"
						value="groups"
						Icon={Users}
						onClick={setMode}
						isSelected={mode === 'groups'}
					/>
					<PermissionsTab
						name="Members"
						value="members"
						Icon={User}
						onClick={setMode}
						isSelected={mode === 'members'}
					/>
					<PermissionsTab
						name="Apps"
						value="apps"
						Icon={Layout}
						onClick={setMode}
						isSelected={mode === 'apps'}
					/>
				</HStack>
			</Flex>

			{getPermissionsLayout()}
		</Flex>
	);
};
