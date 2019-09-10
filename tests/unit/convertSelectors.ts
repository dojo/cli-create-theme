import { convertSelectorsToCSS, convertSelectorsToDefinition } from '../../src/convertSelectors';

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
		const css = convertSelectorsToCSS(['key', ' _key', 'key_', '_key_']);
		assert.equal(css, '.key {}\n\n.key_ {}\n\n._key_ {}');
	});

	it('Returns an empty string when no selectors are passed', () => {
		const css = convertSelectorsToCSS([]);
		assert.equal(css, '');
	});
});

describe('Converting selectors to definition', () => {
	it('Converts a single selector to definition', () => {
		const definitions = convertSelectorsToDefinition(['selector1']);
		assert.equal(definitions, 'export const selector1: string;');
	});

	it('Converts many selectors to CSS', () => {
		const definitions = convertSelectorsToDefinition(['selector1', '  selector2  ', 'selector3']);
		assert.equal(
			definitions,
			'export const selector1: string;\nexport const selector2: string;\nexport const selector3: string;'
		);
	});

	it('Removes the _key selector', () => {
		const definitions = convertSelectorsToDefinition(['key', ' _key', 'key_', '_key_']);
		assert.equal(definitions, 'export const key: string;\nexport const key_: string;\nexport const _key_: string;');
	});

	it('Returns an empty string when no selectors are passed', () => {
		const definitions = convertSelectorsToDefinition([]);
		assert.equal(definitions, '');
	});
});
