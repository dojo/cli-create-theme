import convertSelectorsToCSS from '../../src/convertSelectorsToCSS';

const { describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

describe('convertSelectorsToCSS', () => {
	it('Converts an array of selectors', () => {
		const returnVal = convertSelectorsToCSS(['selector-1', '  selector-2  ', 'selector-3']);
		assert.equal(returnVal, '.selector-1 {}\n\n.selector-2 {}\n\n.selector-3 {}');
	});

	it('Removes the _key selector', () => {
		const returnVal = convertSelectorsToCSS(['key', '_key', 'key_', '_key_']);
		assert.equal(returnVal, '.key {}\n\n.key_ {}\n\n._key_ {}');
	});
});
