import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactQueryDevtools } from 'react-query/devtools';

import { theme } from '@/lib/chakra-ui';
import { queryClient } from '@/lib/react-query';

export const DashboardContainer = ({ children }) => {
	return (
		<BrowserRouter>
			<ChakraProvider theme={theme}>
				<QueryClientProvider client={queryClient}>
					{children}
					<ReactQueryDevtools position="bottom-right" />
				</QueryClientProvider>
			</ChakraProvider>
		</BrowserRouter>
	);
};
