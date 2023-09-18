export const WORKSPACE_ID = '6db13881-1ba4-4412-9ae7-a21fb0e52d2d';

const GENERIC_DATABASE_FIELDS = [
	{
		id: 'creds.host',
		type: 'text',
		name: 'Host',
		required: true,
		placeholder: 'Enter Host URL',
	},
	{
		id: 'creds.username',
		type: 'text',
		name: 'Username',
		placeholder: 'Enter username',
		required: true,
	},
	{
		id: 'creds.password',
		type: 'password',
		name: 'Password',
		placeholder: 'Enter password',
		required: true,
	},
	{
		id: 'creds.database',
		type: 'text',
		name: 'Database',
		placeholder: 'Enter database name',
		required: true,
	},
	{
		id: 'creds.port',
		type: 'number',
		name: 'Port',
		required: true,
		placeholder: 'Enter port (5432)',
	},
];

export const BASE_SOURCE_FIELDS: any = [
	{
		id: 'name',
		type: 'text',
		name: 'Name',
		required: 'Please input name',
		placeholder: 'Enter destination name',
	},
	{
		id: 'description',
		type: 'text',
		name: 'Description',
		placeholder: 'Enter destination description',
	},
	{
		id: 'type',
		type: 'select',
		name: 'Type',
		required: 'Please select Type',
		placeholder: 'Select destination type',
		options: ['postgres'],
	},
];

export const SOURCE_BASED_INPUTS: any = {
	postgres: GENERIC_DATABASE_FIELDS,
};
