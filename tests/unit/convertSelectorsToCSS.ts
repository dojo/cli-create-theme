import convertSelectorsToCSS from '../../src/convertSelectorsToCSS';

const { describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

describe('Converting selectors to CSS', () => {
	it('Converts a single selector to CSS', () => {
		const css = convertSelectorsToCSS(['selector-1']);
		assert.equal(css, '.selector-1 {}');
	});

	it('Converts many selectors to CSS', () => {
		const css = convertSelectorsToCSS(['selector-1', '  selector-2  ', 'selector-3']);
		assert.equal(css, '.selector-1 {}\n\n.selector-2 {}\n\n.selector-3 {}');
	});

	it('Removes the _key selector', () => {
		const css = convertSelectorsToCSS(['key', '_key', 'key_', '_key_']);
		assert.equal(css, '.key {}\n\n.key_ {}\n\n._key_ {}');
	});

	it('Returns an empty string when no selectors are passed', () => {
		const css = convertSelectorsToCSS([]);
		assert.equal(css, '');
	});
});
