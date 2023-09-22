import { Skeleton, Stack } from '@chakra-ui/react';

export const NavLoader = ({ children, isLoading }: any) => {
	if (isLoading) {
		return (
			<Stack p={4} h={14} bg="white" borderBottomWidth="1px">
				<Skeleton h="full" />
			</Stack>
		);
	}

	return children;
};

export const ContentLoader = ({ children, isLoading }: any) => {
	if (isLoading) {
		return (
			<Stack h="full" bg="white" p={4}>
				<Skeleton h="full" minH="20" startColor="gray.100" endColor="gray.200" />
			</Stack>
		);
	}

	return children;
};

export const Loader = ({ children, isLoading }: any) => {
	if (isLoading) {
		return (
			<Stack spacing="0" h="full" bg="white">
				<NavLoader isLoading />
				<ContentLoader isLoading />
			</Stack>
		);
	}

	return children;
};
