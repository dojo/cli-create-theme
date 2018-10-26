export function convertSelectorsToCSS(selectors: string[]): string {
	return selectors
		.map((selector) => selector.trim())
		.filter((selector) => selector !== '_key')
		.map((selector) => `.${selector} {}`)
		.join('\n\n');
}

export function convertSelectorsToDefinition(selectors: string[]): string {
	return selectors
		.map((selector) => selector.trim())
		.filter((selector) => selector !== '_key')
		.map((selector) => `export const ${selector}: string;`)
		.join('\n');
}
