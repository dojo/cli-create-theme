import { join } from 'path';
import * as camelcase from 'camelcase';
import chalk from 'chalk';
import WidgetDataInterface from './WidgetDataInterface';
import { info } from './logging';

const pkgDir: any = require('pkg-dir');
const packagePath = pkgDir.sync(__dirname);

function createThemeFile({
	relativeThemeFilePath,
	absoluteThemeFilePath,
	themedWidgets,
	CSSModuleExtension,
	renderFiles
}: {
	relativeThemeFilePath: string;
	absoluteThemeFilePath: string;
	themedWidgets: WidgetDataInterface[];
	CSSModuleExtension: string;
	renderFiles: any;
}): void {
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

	const src = join(packagePath, 'templates', 'src', `theme.ts.ejs`);

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

	info(`\nPlease import '${chalk.bold.underline(relativeThemeFilePath)}' into your project to use your new theme`);
}

export default createThemeFile;
