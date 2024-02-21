import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactQueryDevtools } from 'react-query/devtools';

import { theme } from '@/lib/chakra-ui';
import { queryClient } from '@/lib/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = '29567616605-al7naomojd9n3hhtt7gdtkmm7vggsb0m.apps.googleusercontent.com';

export const DashboardContainer = ({ children }: any) => {
	return (
		<BrowserRouter>
			<ChakraProvider theme={theme}>
				<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
					<QueryClientProvider client={queryClient}>
						{children}
						<ReactQueryDevtools position="bottom-right" />
					</QueryClientProvider>
				</GoogleOAuthProvider>
			</ChakraProvider>
		</BrowserRouter>
	);
};
