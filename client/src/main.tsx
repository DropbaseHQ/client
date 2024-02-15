// import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { Dashboard } from './Dashboard';

const GOOGLE_CLIENT_ID = '29567616605-al7naomojd9n3hhtt7gdtkmm7vggsb0m.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')!).render(
	// <React.StrictMode>
	<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
		<Dashboard />,
	</GoogleOAuthProvider>,
	// </React.StrictMode>,
);
