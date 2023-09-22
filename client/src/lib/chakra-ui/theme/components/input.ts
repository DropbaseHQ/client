import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools';

const variants = {
	outline: (props: StyleFunctionProps) => ({
		field: {
			borderRadius: 'sm',
		},
		addon: {
			borderRadius: 'lg',
			bg: mode('gray.50', 'gray.700')(props),
		},
	}),
};

export default {
	variants,
	defaultProps: {
		colorScheme: 'gray',
	},
};
