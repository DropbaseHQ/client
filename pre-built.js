import fs from 'fs';
import 'dotenv/config';

const getMainFileName = () => {
	switch (process.env.VITE_APP_TYPE) {
		case 'app': {
			return 'main-app';
		}
		case 'worker': {
			return 'main';
		}
		case 'free': {
			return 'main-free';
		}
		default:
			return 'main-free';
	}
};

let data = `<!doctype html>
<html lang="en">
	<head>
		<!-- Primary Meta Tags -->
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta
			name="title"
			content="Dropbase | Build internal apps with SQL and Python in minutes"
		/>
		<title>Dropbase | Build internal apps with SQL and Python in minutes</title>

		<!-- Open Graph / Facebook -->
		<meta
			content="Dropbase | Build internal apps with SQL and Python in minutes"
			property="og:title"
		/>
		<meta
			content="Dropbase is a developer platform that makes it easy to build internal apps for customer success, support, and operations teams. Dashboards, admin panels, and custom tools with SQL and Python in minutes."
			property="og:description"
		/>
		<meta
			content="https://cf-simple-s3-origin-cloudfrontfors3-355320424519.s3.amazonaws.com/dropbase-app-assets/DropbaseApps.png"
			property="og:image"
		/>
		<meta property="og:type" content="website" />
		<meta property="og:url" content="https://app.dropbase.io/" />

		<!-- Twitter -->
		<meta
			content="Dropbase | Build internal apps with SQL and Python in minutes"
			property="twitter:title"
		/>
		<meta
			content="Dropbase is a developer platform that makes it easy to build internal apps for customer success, support, and operations teams. Dashboards, admin panels, and custom tools with SQL and Python in minutes."
			property="twitter:description"
		/>
		<meta
			content="https://cf-simple-s3-origin-cloudfrontfors3-355320424519.s3.amazonaws.com/dropbase-app-assets/DropbaseApps.png"
			property="twitter:image"
		/>
		<meta content="summary_large_image" name="twitter:card" />
		<meta property="twitter:url" content="https://app.dropbase.io/" />

		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
		<link
			href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap"
			rel="stylesheet"
		/>
	</head>
	<body>
		<div id="root"></div>
		<div id="portal" style="position: fixed; left: 0; top: 0; z-index: 9999" />

		<script type="module" src="./src/${getMainFileName()}.tsx"></script>
	</body>
</html>
`;

fs.writeFile('index.html', data, (err) => {
	if (err) console.log(err);
	else {
		console.log('index.html file generated successfully\n');
	}
});
