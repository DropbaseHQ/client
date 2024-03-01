import { useState } from 'react';
import { Flex, Box, Text, HStack } from '@chakra-ui/react';
import { GroupPermissions } from './GroupPermissions';
import { MemberPermissions } from './MemberPermissions';
import { AppPermissions } from './AppPermissions';

const PermissionsTab = ({ name, value, onClick, isSelected }: any) => {
	return (
		<Box
			_hover={{
				bgColor: 'gray.100',
				cursor: 'pointer',
			}}
			bgColor={isSelected ? 'gray.100' : ''}
			p="3"
			onClick={() => onClick(value)}
		>
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
						onClick={setMode}
						isSelected={mode === 'groups'}
					/>
					<PermissionsTab
						name="Members"
						value="members"
						onClick={setMode}
						isSelected={mode === 'members'}
					/>
					<PermissionsTab
						name="Apps"
						value="apps"
						onClick={setMode}
						isSelected={mode === 'apps'}
					/>
				</HStack>
			</Flex>

			{getPermissionsLayout()}
		</Flex>
	);
};
