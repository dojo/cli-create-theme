import { join } from 'path';
import * as camelcase from 'camelcase';
import * as fs from 'fs-extra';
import chalk from 'chalk';
import WidgetDataInterface from './WidgetDataInterface';

const pkgDir: any = require('pkg-dir');
const packagePath = pkgDir.sync(__dirname);

function createThemeFile({
	themesDirectory,
	themedWidgets,
	CSSModuleExtension,
	renderFiles
}: {
	themesDirectory: string;
	themedWidgets: WidgetDataInterface[];
	CSSModuleExtension: string;
	renderFiles: any;
}): void {
	const mainThemeFileName = `theme.ts`;
	const relativeThemeFilePath = join(themesDirectory, mainThemeFileName);
	const absoluteThemeFilePath = join(process.cwd(), relativeThemeFilePath);

	if (fs.existsSync(absoluteThemeFilePath)) {
		console.info(
			`A theme file already exists in '${chalk.bold.underline(relativeThemeFilePath)}'. Will not overwrite.`
		);
		return;
	}

	const CSSModulesData = themedWidgets.map(({ themeKey, fileName }) => {
		themeKey = themeKey.split(/[\\]+/).join('/');
		const CSSModulePath = `${themeKey}/${fileName}${CSSModuleExtension}`;
		const themeKeyVariable = camelcase(fileName);

		return {
			path: CSSModulePath,
			themeKeyVariable,
			themeKey
		};
	});

	const src = join(packagePath, 'templates', 'src', `${mainThemeFileName}.ejs`);

	renderFiles(
		[
			{
				src,
				dest: absoluteThemeFilePath
			}
		],
		{
			CSSModules: CSSModulesData
		}
	);

	console.info(
		`\nPlease import '${chalk.bold.underline(relativeThemeFilePath)}' into your project to use your new theme`
	);
}

export default createThemeFile;
