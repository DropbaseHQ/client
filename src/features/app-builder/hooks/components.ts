import { useQuery } from 'react-query';

import { workerAxios } from '@/lib/axios';

const fetchComponentFields = async () => {
	const response = await workerAxios.get<any>(`/components/properties/all`);

	return response.data;
};

export const useResourceFields = () => {
	const queryKey = ['resource/fields'];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchComponentFields(), {
		cacheTime: Infinity,
		staleTime: Infinity,
	});

	return {
		...rest,
		queryKey,
		fields: response || {},
	};
};
