import * as fs from 'fs-extra';
import * as globby from 'globby';
import * as mkdirp from 'mkdirp';
import { join, basename } from 'path';

import WidgetDataInterface from './WidgetDataInterface';
import createThemeFile from './createThemeFile';
import convertSelectorsToCSS from './convertSelectorsToCSS';
import {
	packageQuestions,
	getFileQuestions,
	askForDesiredFiles,
	askForPackageName
} from './questions';

async function run() {
	const themesDirectory = 'src/themes';
	const packageName = await askForPackageName(packageQuestions);

	const selectedpackagePath = join('node_modules', packageName, 'theme');

	if (!fs.existsSync(selectedpackagePath)) {
		throw new Error(`This package path does not exist: ${selectedpackagePath}`);
	}

	const cssDataFileExtension = '.m.css.js';
	const CSSModuleExtension = '.m.css';
	const cssDataFileGlob = join(selectedpackagePath, `**/*${cssDataFileExtension}`);
	const matchingCSSFiles = globby.sync(cssDataFileGlob);

	const fileQuestions = getFileQuestions(packageName, matchingCSSFiles, cssDataFileExtension);
	const selectedWidgets = await askForDesiredFiles(fileQuestions);

	const themedWidgets = selectedWidgets.map((selectedWidget: string): WidgetDataInterface => {
		const [fileName] = basename(selectedWidget).split(cssDataFileExtension);
		const themeKey = join(packageName, fileName);
		const fullWidgetPath = join(process.cwd(), selectedWidget);
		const selectors = Object.keys(require(fullWidgetPath));

		const newFileOutput = convertSelectorsToCSS(selectors);
		const widgetThemePath = `${themesDirectory}/${themeKey}`;
		const newFilePath = join(process.cwd(), `${widgetThemePath}/${fileName}${CSSModuleExtension}`);

		mkdirp.sync(widgetThemePath);
		fs.writeFileSync(newFilePath, newFileOutput);

		return {
			themeKey,
			fileName
		};
	});

	await createThemeFile({
		themesDirectory,
		themedWidgets,
		CSSModuleExtension
	});
}

export default run;
