import { Stack, Text } from '@chakra-ui/react';

export const PageLayout = ({ children, title, action, pageProps, titleProps }: any) => {
	return (
		<Stack p="6" h="full" {...pageProps}>
			<Stack mb="3" {...titleProps} alignItems="center" direction="row">
				<Text fontWeight="bold" fontSize="xl">
					{title}
				</Text>
				{action}
			</Stack>
			{children}
		</Stack>
	);
};
