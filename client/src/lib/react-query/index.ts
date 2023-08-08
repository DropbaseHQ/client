import { AxiosError } from 'axios';
import { QueryClient, UseMutationOptions, UseQueryOptions } from 'react-query';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 1000, // make data stale in 5 seconds
			refetchOnWindowFocus: false,
			retry: false,
		},
	},
});

// Taken from: https://github.com/alan2207/bulletproof-react/blob/master/src/lib/react-query.ts#L15-L28

export type ExtractFnReturnType<FnType extends (...args: any) => any> = Awaited<ReturnType<FnType>>;

export type MutationConfig<MutationFnType extends (...args: any) => any> = UseMutationOptions<
	ExtractFnReturnType<MutationFnType>,
	AxiosError,
	Parameters<MutationFnType>[0]
>;

export type QueryConfig<QueryFnType extends (...args: any) => any> = Omit<
	UseQueryOptions<ExtractFnReturnType<QueryFnType>>,
	'queryKey' | 'queryFn'
>;
