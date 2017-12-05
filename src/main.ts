import { join, basename } from 'path';
import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';
import * as globby from 'globby';
import * as mkdirp from 'mkdirp';
import * as camelcase from 'camelcase';
import renderFiles from '@dojo/cli-create-app/renderFiles';

interface WidgetDataInterface {
	themeKey: string;
	fileName: string;
}

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

const packageQuestions: inquirer.Question[] = [{
	type: 'input',
	name: 'package',
	message: 'What Package to do you want to theme?'
}];

function askForPackageName(packageQuestions: inquirer.Question[]): Promise<string> {
	return inquirer.prompt(packageQuestions).then((answers: inquirer.Answers) => {
		return answers.package;
	});
}

async function askForDesiredFiles(fileQuestions: inquirer.Question[]): Promise<string[]> {
	const { files } = await inquirer.prompt(fileQuestions);
	return files;
}

function getFileQuestions(packageName: string, files: string[], cssDataFileExtension: string): inquirer.Question[] {
	return [{
		type: 'checkbox',
		message: `Which of the ${packageName} theme files would you like to scaffold?`,
		name: 'files',
		choices: files.map((name: string): inquirer.ChoiceType => {
			return {
				name: basename(name).split(cssDataFileExtension)[0],
				value: name
			};
		})
	}];
}

function convertSelectorsToCSS(selectors: string[]): string {
	return selectors
		.map((selector) => selector.trim())
		.filter((selector) => selector !== '_key')
		.map((selector) => `.${selector} {}`)
		.join('\n\n');
}

const command = {
	description: 'Generate theme files from widgets',
	register() {},
	async run() {
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
			const fileName = basename(selectedWidget).split(cssDataFileExtension)[0];
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
	},

	eject() {
		return {
			npm: {
				devDependencies: {
				}
			},
			copy: {
			}
		};
	}
};
export default command;
