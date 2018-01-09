import { join } from 'path';
import * as camelcase from 'camelcase';
import * as fs from 'fs-extra';
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
	const fullThemeFilePath = join(process.cwd(), themesDirectory, mainThemeFileName);

	if (fs.existsSync(fullThemeFilePath)) {
		console.log(`A theme file already exists in ${fullThemeFilePath}. Will not overwrite.`);
		return;
	}

	const CSSModulesData = themedWidgets.map(({ themeKey, fileName }) => {
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
				dest: fullThemeFilePath
			}
		],
		{
			CSSModules: CSSModulesData
		}
	);

	console.log(`Please import '${fullThemeFilePath}' into your project to use your new theme`);
}

export default createThemeFile;
