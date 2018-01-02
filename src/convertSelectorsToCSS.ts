function convertSelectorsToCSS(selectors: string[]): string {
	return selectors
		.map((selector) => selector.trim())
		.filter((selector) => selector !== '_key')
		.map((selector) => `.${selector} {}`)
		.join('\n\n');
}

export default convertSelectorsToCSS;
