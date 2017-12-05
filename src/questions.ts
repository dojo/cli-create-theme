import * as inquirer from 'inquirer';
import { basename } from 'path';

const packageQuestions: inquirer.Question[] = [{
	type: 'input',
	name: 'package',
	message: 'What Package to do you want to theme?'
}];

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

function askForPackageName(packageQuestions: inquirer.Question[]): Promise<string> {
	return inquirer.prompt(packageQuestions).then((answers: inquirer.Answers) => {
		return answers.package;
	});
}

async function askForDesiredFiles(fileQuestions: inquirer.Question[]): Promise<string[]> {
	const { files } = await inquirer.prompt(fileQuestions);
	return files;
}

export {
	packageQuestions,
	getFileQuestions,
	askForPackageName,
	askForDesiredFiles
}
