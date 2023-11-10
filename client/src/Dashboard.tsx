import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactQueryDevtools } from 'react-query/devtools';

import { theme } from '@/lib/chakra-ui';
import { queryClient } from '@/lib/react-query';
import { DashboardRoutes } from '@/routes';

export const Dashboard = () => {
	return (
		<BrowserRouter>
			<ChakraProvider theme={theme}>
				<QueryClientProvider client={queryClient}>
					<DashboardRoutes />
					<ReactQueryDevtools position="bottom-right" />
				</QueryClientProvider>
			</ChakraProvider>
		</BrowserRouter>
	);
};
