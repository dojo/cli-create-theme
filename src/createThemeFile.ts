import renderFiles from '@dojo/cli-create-app/renderFiles';
import { join, basename } from 'path';
import * as camelcase from 'camelcase';
import * as fs from 'fs-extra';
import WidgetDataInterface from './WidgetDataInterface';

const pkgDir: any = require('pkg-dir');
const packagePath = pkgDir.sync(__dirname);

async function createThemeFile({
	themesDirectory,
	themedWidgets,
	CSSModuleExtension
}: {
	themesDirectory: string,
	themedWidgets: WidgetDataInterface[],
	CSSModuleExtension: string
}): Promise<void> {
	const mainThemeFileName = `theme.ts`;
	const fullThemeFilePath = join(process.cwd(), themesDirectory, mainThemeFileName);

	if (fs.existsSync(fullThemeFilePath)) {
		console.log(`A theme file already exists in ${fullThemeFilePath}. Will not overwrite.`);
		return;
	}

	const CSSModulesData = themedWidgets.map(({
		themeKey, fileName
	}) => {
		const CSSModulePath = `${themeKey}/${fileName}${CSSModuleExtension}`;
		const themeKeyVariable = camelcase(fileName);

		return {
			path: CSSModulePath,
			themeKeyVariable,
			themeKey
		};
	});

	await renderFiles([{
		src: join(packagePath, 'templates', 'src', `${mainThemeFileName}.ejs`),
		dest: fullThemeFilePath
	}], {
		CSSModules: CSSModulesData
	});
}

export default createThemeFile;
