import { get } from 'lodash';

export const checkAllRulesPass = ({ values, rules }: any) => {
	if (!rules || rules?.length === 0) {
		return true;
	}
	const invalidRule = rules.find((r: any) => {
		const fieldValue = get(values, r.name);
		switch (r.operator) {
			case 'equals': {
				return r.value !== fieldValue;
			}
			case 'gt': {
				return r.value >= fieldValue;
			}
			case 'gte': {
				return r.value > fieldValue;
			}
			case 'lt': {
				return r.value <= fieldValue;
			}
			case 'lte': {
				return r.value <= fieldValue;
			}
			case 'exists': {
				return !(r.name in values);
			}
			default:
				return false;
		}
	});
	return !invalidRule;
};
