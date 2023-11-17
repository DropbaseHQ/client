import { useQuery } from 'react-query';
import { Circle, Stack, Text } from '@chakra-ui/react';
import { workerAxios } from '../lib/axios';

export const STATUS_QUERY_KEY = 'allFiles';

const fetchStatus: any = async () => {
	const response = await workerAxios.get<any>(`/sources/`);
	return response.data;
};

export const useStatus = () => {
	const queryKey = [STATUS_QUERY_KEY];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchStatus(), {
		refetchInterval: 10 * 1000,
		refetchIntervalInBackground: true,
	});

	return {
		...rest,
		queryKey,
	};
};

export const StatusBar = () => {
	// const { isLoading } = useStatus();

	return (
		<Stack
			direction="row"
			spacing="1"
			alignItems="center"
			fontWeight="medium"
			p="1"
			h="full"
			bg="white"
			borderTopWidth="1px"
		>
			<Circle size="2" bg="green" />
			<Text fontSize="xs">Connected</Text>
		</Stack>
	);
};
