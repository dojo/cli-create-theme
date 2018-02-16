import run, { CreateThemeArgs } from './run';
import register from './register';
import { Command } from '@dojo/cli/interfaces';

const command: Command<CreateThemeArgs> = {
	description: 'Generate theme files from widgets',
	register,
	run
};

export default command;
