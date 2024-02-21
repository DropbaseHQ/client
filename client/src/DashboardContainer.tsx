import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactQueryDevtools } from 'react-query/devtools';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { theme } from '@/lib/chakra-ui';
import { queryClient } from '@/lib/react-query';

export const DashboardContainer = ({ children }: any) => {
	return (
		<BrowserRouter>
			<ChakraProvider theme={theme}>
				<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
					<QueryClientProvider client={queryClient}>
						{children}
						<ReactQueryDevtools position="bottom-right" />
					</QueryClientProvider>
				</GoogleOAuthProvider>
			</ChakraProvider>
		</BrowserRouter>
	);
};
