export const PermissionContainer = ({ isAllowed, children }: any) => {
	if (isAllowed) {
		return children;
	}

	return null;
};
