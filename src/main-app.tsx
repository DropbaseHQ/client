import ReactDOM from 'react-dom/client';
import { DashboardContainer } from './DashboardContainer';
import { ProdDashboardRoutes } from './routes/ProdDashboardRoutes';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<DashboardContainer>
		<ProdDashboardRoutes />
	</DashboardContainer>,
);
