import { Helper } from '@dojo/cli/interfaces';
import * as fs from 'fs-extra';
import * as globby from 'globby';
import { mkdirsSync } from 'fs-extra';
import { join, basename } from 'path';
import chalk from 'chalk';

import WidgetDataInterface from './WidgetDataInterface';
import createThemeFile from './createThemeFile';
import { convertSelectorsToCSS, convertSelectorsToDefinition } from './convertSelectors';

import { packageQuestions, getFileQuestions, askForDesiredFiles, askForPackageNames } from './questions';
import { info } from './logging';

export interface CreateThemeArgs {
	name: string;
}

async function run(helper: Helper, args: CreateThemeArgs) {
	const themeName = args.name;
	const CSSModuleExtension = '.m.css';
	const CSSModuleDefinitionExtension = `${CSSModuleExtension}.d.ts`;
	const themesDirectory = `src/themes/${themeName}`;
	const packageNames = await askForPackageNames(packageQuestions);
	const allWidgets = [];

	const relativeThemeFilePath = join(themesDirectory, 'theme.ts');
	const absoluteThemeFilePath = join(process.cwd(), relativeThemeFilePath);

	if (fs.existsSync(absoluteThemeFilePath)) {
		throw new Error(`A theme file already exists in '${relativeThemeFilePath}'`);
	}

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

		const themedWidgets = selectedWidgets.map(
			(selectedWidget: string): WidgetDataInterface => {
				const [fileName] = basename(selectedWidget).split(cssDataFileExtension);
				const themeKey = join(packageName, fileName);
				const fullWidgetPath = join(process.cwd(), selectedWidget);
				const selectors = Object.keys(require(fullWidgetPath));

				const widgetThemePath = `${themesDirectory}/${themeKey}`;
				mkdirsSync(widgetThemePath);

				const newFileOutput = convertSelectorsToCSS(selectors);
				const newFilePath = join(process.cwd(), `${widgetThemePath}/${fileName}${CSSModuleExtension}`);
				const newDefinitionFileOutput = convertSelectorsToDefinition(selectors);
				const newDefinitionFilePath = join(
					process.cwd(),
					`${widgetThemePath}/${fileName}${CSSModuleDefinitionExtension}`
				);

				fs.writeFileSync(newDefinitionFilePath, newDefinitionFileOutput);
				fs.writeFileSync(newFilePath, newFileOutput);
				info(chalk.green.bold(' create ') + newFilePath);

				return {
					themeKey,
					fileName
				};
			}
		);

		allWidgets.push(...themedWidgets);
	}

	createThemeFile({
		renderFiles: helper.command.renderFiles,
		absoluteThemeFilePath,
		relativeThemeFilePath,
		themedWidgets: allWidgets,
		CSSModuleExtension
	});
}

export default run;
