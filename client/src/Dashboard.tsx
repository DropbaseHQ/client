import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactQueryDevtools } from 'react-query/devtools';

import { theme } from '@/lib/chakra-ui';
import { queryClient } from '@/lib/react-query';
import { DashboardRoutes, ProdDashboardRoutes } from '@/routes';
import { isProductionApp } from './utils';

export const Dashboard = () => {
	const isProductionURL = isProductionApp();

	return (
		<BrowserRouter>
			<ChakraProvider theme={theme}>
				<QueryClientProvider client={queryClient}>
					{isProductionURL ? <ProdDashboardRoutes /> : <DashboardRoutes />}
					<ReactQueryDevtools position="bottom-right" />
				</QueryClientProvider>
			</ChakraProvider>
		</BrowserRouter>
	);
};
