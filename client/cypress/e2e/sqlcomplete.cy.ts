import { completePhrase } from '@/hooks/completion';

const SAMPLE_COMPLETION_DATA = {
	public: {
		customers: ['id', 'name', 'email'],
	},
	stripe: {
		customers: ['id', 'name', 'email', 'address'],
		subscriptions: ['id', 'customer_id', 'plan_id'],
	},
};

describe('sql autocomplete', () => {
	it('should not return completions without AS or FROM', () => {
		expect(completePhrase('potato tomato', SAMPLE_COMPLETION_DATA)).to.be.empty;
		expect(completePhrase('', SAMPLE_COMPLETION_DATA)).to.be.empty;
	});

	it('should return schema and table completions for FROM', () => {
		expect(completePhrase('FROM "', SAMPLE_COMPLETION_DATA).map((e) => e.label)).to.deep.equal([
			'public.customers',
			'stripe.customers',
			'stripe.subscriptions',
		]);

		expect(completePhrase('FROM pu', SAMPLE_COMPLETION_DATA).map((e) => e.label)).to.deep.equal(
			['public.customers'],
		);

		expect(
			completePhrase('FROM stripe', SAMPLE_COMPLETION_DATA).map((e) => e.label),
		).to.deep.equal(['stripe.customers', 'stripe.subscriptions']);
	});
});
