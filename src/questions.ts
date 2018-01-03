import * as inquirer from 'inquirer';
import { basename } from 'path';

const packageQuestions: inquirer.Question[] = [
	{
		type: 'input',
		name: 'package',
		message: 'What Package to do you want to theme?'
	},
	{
		type: 'confirm',
		name: 'askAgain',
		message: 'Any more?',
		default: true
	}
];

function getFileQuestions(packageName: string, files: string[], cssDataFileExtension: string): inquirer.Question[] {
	return [
		{
			type: 'checkbox',
			message: `Which of the ${packageName} theme files would you like to scaffold?`,
			name: 'files',
			choices: files.map((name: string): inquirer.ChoiceType => {
				return {
					name: basename(name).split(cssDataFileExtension)[0],
					value: name
				};
			})
		}
	];
}

async function askForPackageNames(packageQuestions: inquirer.Question[], packages: any[] = []): Promise<string[]> {
	const answer = await inquirer.prompt(packageQuestions);
	packages.push(answer.package);

	if (answer.askAgain) {
		return await askForPackageNames(packageQuestions, packages);
	} else {
		return packages;
	}
}

async function askForDesiredFiles(fileQuestions: inquirer.Question[]): Promise<string[]> {
	const { files } = await inquirer.prompt(fileQuestions);
	return files;
}

export { packageQuestions, getFileQuestions, askForPackageNames, askForDesiredFiles };
