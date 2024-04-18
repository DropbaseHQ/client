import { isFreeApp } from '@/utils';

export const RestrictAppContainer = ({ children }: any) => {
	if (isFreeApp()) {
		return null;
	}

	return children;
};
