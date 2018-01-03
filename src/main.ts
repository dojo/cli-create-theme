import run from './run';

const command = {
	description: 'Generate theme files from widgets',
	register() {},
	run,
	eject() {
		return {
			npm: {
				devDependencies: {}
			},
			copy: {}
		};
	}
};

export default command;
