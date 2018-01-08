import { Helper } from '@dojo/interfaces/cli';
import * as fs from 'fs-extra';
import * as globby from 'globby';
import * as mkdirp from 'mkdirp';
import { join, basename } from 'path';

import WidgetDataInterface from './WidgetDataInterface';
import createThemeFile from './createThemeFile';
import convertSelectorsToCSS from './convertSelectorsToCSS';

import { packageQuestions, getFileQuestions, askForDesiredFiles, askForPackageNames } from './questions';

async function run(helper: Helper) {
	const CSSModuleExtension = '.m.css';
	const themesDirectory = 'src/themes';
	const packageNames = await askForPackageNames(packageQuestions);
	const allWidgets = [];

	for (const packageName of packageNames) {
		const selectedpackagePath = join('node_modules', packageName, 'theme');

		if (!fs.existsSync(selectedpackagePath)) {
			throw new Error(`This package path does not exist: ${selectedpackagePath}`);
		}

		const cssDataFileExtension = '.m.css.js';
		const cssDataFileGlob = join(selectedpackagePath, `**/*${cssDataFileExtension}`);
		const matchingCSSFiles = globby.sync(cssDataFileGlob);

		const fileQuestions = getFileQuestions(packageName, matchingCSSFiles, cssDataFileExtension);
		const selectedWidgets = await askForDesiredFiles(fileQuestions);
		if (!selectedWidgets.length) {
			throw new Error('No widgets were selected');
		}

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

		allWidgets.push(...themedWidgets);
	}

	createThemeFile({
		renderFiles: helper.command.renderFiles,
		themesDirectory,
		themedWidgets: allWidgets,
		CSSModuleExtension
	});
}

export default run;
