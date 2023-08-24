import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import '@fontsource-variable/inter';
import { QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';

import { queryClient } from '@/lib/react-query';
import { DashboardRoutes } from '@/routes';

export const Dashboard = () => {
	const theme = extendTheme({
		fonts: {
			heading: `Inter, apple-system, sans-serif`,
			body: `Inter, apple-system, sans-serif`,
		},
	});
	return (
		<BrowserRouter>
			<ChakraProvider theme={theme}>
				<QueryClientProvider client={queryClient}>
					<DashboardRoutes />
				</QueryClientProvider>
			</ChakraProvider>
		</BrowserRouter>
	);
};
