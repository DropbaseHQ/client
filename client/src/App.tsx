import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';

import { theme } from '@/lib/chakra-ui';
import { queryClient } from '@/lib/react-query';
import { AppRoutes } from '@/routes';

export const App = () => {
	return (
		<BrowserRouter>
			<ChakraProvider theme={theme}>
				<QueryClientProvider client={queryClient}>
					<AppRoutes />
				</QueryClientProvider>
			</ChakraProvider>
		</BrowserRouter>
	);
};
