import { useQuery } from 'react-query';

export const SCHEMA_QUERY_KEY = 'all-schema';

const fetchSchema = async () => {
	await new Promise((resolve) => {
		setTimeout(() => {
			resolve('123');
		}, Math.random() * 2500);
	});

	return {
		public: {
			customers: ['id', 'test', 'name'],
			users: ['id', 'email'],
		},
		stripe: { subscriptions: ['id'] },
	};
};

export const useSchema = () => {
	const queryKey = [SCHEMA_QUERY_KEY];

	const { data: response, ...rest } = useQuery(queryKey, () => fetchSchema());

	return {
		...rest,
		schema: response,
		queryKey,
	};
};
