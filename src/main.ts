import run from './run';
import { Command } from '@dojo/interfaces/cli';

const command: Command = {
	description: 'Generate theme files from widgets',
	register() {},
	run
};

export default command;
