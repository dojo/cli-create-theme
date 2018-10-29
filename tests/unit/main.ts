import * as mockery from 'mockery';
import * as sinon from 'sinon';
import { join } from 'path';
import chalk from 'chalk';

const { describe, it, beforeEach, afterEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

const noopModule = {
	default: () => {}
};

describe('The main runner', () => {
	let sandbox: sinon.SinonSandbox;

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		mockery.enable({ warnOnUnregistered: false, useCleanCache: true });
	});

	afterEach(() => {
		sandbox.restore();
		mockery.deregisterAll();
		mockery.resetCache();
		mockery.disable();
	});

	it(`errors if the package cannot be found`, async () => {
		const promptStub: sinon.SinonStub = sandbox.stub();

		promptStub.returns(
			Promise.resolve({
				package: 'some-package'
			})
		);

		mockery.registerMock('inquirer', {
			prompt: promptStub
		});

		const run = require('../../src/run').default;

		let errorMessage = '';

		try {
			await run({}, { name: 'testName' });
		} catch (err) {
			errorMessage = err;
		}

		assert.equal(
			errorMessage,
			'Error: This package path does not exist: ' + join('node_modules', 'some-package', 'theme')
		);
	});

	it('errors if no widgets selections are made', async () => {
		mockery.registerMock('./createThemeFile', noopModule);
		mockery.registerMock('./convertSelectorsToCSS', noopModule);

		mockery.registerMock('./questions', {
			packageQuestions: 'a question',
			getFileQuestions: () => {},
			askForDesiredFiles: () => Promise.resolve([]),
			askForPackageNames: () => Promise.resolve(['package name 1'])
		});

		mockery.registerMock('path', {
			join: () => {},
			basename: () => {}
		});

		mockery.registerMock('fs-extra', {
			existsSync: () => true,
			writeFileSync: () => {},
			mkdirsSync: () => {}
		});

		mockery.registerMock('globby', {
			sync: () => {}
		});

		const run = require('../../src/run').default;

		let errorMessage = '';

		try {
			await run({}, { name: 'testName' });
		} catch (err) {
			errorMessage = err;
		}

		assert.equal(errorMessage, 'Error: No widgets were selected');
	});

	it('Creates CSS module files', async () => {
		const writeFileSyncStub: sinon.SinonStub = sandbox.stub();
		const mkdirsSyncStub: sinon.SinonStub = sandbox.stub();

		const joinStub: sinon.SinonStub = sandbox.stub();
		const loggingStub: sinon.SinonStub = sandbox.stub();

		joinStub.onCall(2).returns('theme-key-1');
		joinStub.onCall(3).returns('./widget/path/1');
		joinStub.onCall(4).returns('new/file/path-1');

		joinStub.onCall(5).returns('theme-key-2');
		joinStub.onCall(6).returns('./widget/path/2');
		joinStub.onCall(7).returns('new/file/path-2');

		mockery.registerMock('./widget/path/1', { key: 'value' });
		mockery.registerMock('./widget/path/2', { key: 'value2' });

		mockery.registerMock('./createThemeFile', noopModule);
		mockery.registerMock('./convertSelectorsToCSS', {
			default: () => 'css file contents'
		});

		mockery.registerMock('./questions', {
			packageQuestions: 'a question',
			getFileQuestions: () => {},
			askForDesiredFiles: () => Promise.resolve(['file-1', 'file-2']),
			askForPackageNames: () => Promise.resolve(['package name 1'])
		});

		mockery.registerMock('path', {
			join: joinStub,
			basename: () => 'basename return string'
		});

		mockery.registerMock('./logging', {
			info: loggingStub
		});

		mockery.registerMock('fs-extra', {
			existsSync: () => true,
			writeFileSync: writeFileSyncStub,
			mkdirsSync: mkdirsSyncStub
		});

		mockery.registerMock('globby', {
			sync: () => {}
		});

		const run = require('../../src/run').default;

		await run(
			{
				command: {
					renderFiles: () => {}
				}
			},
			{
				name: 'testName'
			}
		);

		assert.equal(mkdirsSyncStub.callCount, 2);
		assert.deepEqual(mkdirsSyncStub.firstCall.args, ['src/themes/testName/theme-key-1']);
		assert.deepEqual(mkdirsSyncStub.secondCall.args, ['src/themes/testName/theme-key-2']);

		assert.equal(writeFileSyncStub.callCount, 2);
		assert.deepEqual(writeFileSyncStub.firstCall.args, ['new/file/path-1', 'css file contents']);
		assert.deepEqual(writeFileSyncStub.secondCall.args, ['new/file/path-2', 'css file contents']);

		assert.equal(loggingStub.callCount, 2);
		assert.deepEqual(loggingStub.firstCall.args, [chalk.green.bold(' create ') + 'new/file/path-1']);
		assert.deepEqual(loggingStub.secondCall.args, [chalk.green.bold(' create ') + 'new/file/path-2']);
	});

	it('Creates a theme file', async () => {
		const createThemeFileStub: sinon.SinonStub = sandbox.stub();

		const joinStub: sinon.SinonStub = sandbox.stub();

		joinStub.onCall(2).returns('theme-key-1');
		joinStub.onCall(3).returns('./widget/path/1');
		joinStub.onCall(4).returns('new/file/path-1');

		mockery.registerMock('./widget/path/1', { key: 'value' });

		mockery.registerMock('./createThemeFile', {
			default: createThemeFileStub
		});
		mockery.registerMock('./convertSelectorsToCSS', {
			default: () => 'css file contents'
		});

		mockery.registerMock('./questions', {
			packageQuestions: 'a question',
			getFileQuestions: () => {},
			askForDesiredFiles: () => Promise.resolve(['file-1']),
			askForPackageNames: () => Promise.resolve(['package name 1'])
		});

		mockery.registerMock('path', {
			join: joinStub,
			basename: () => 'basename return string'
		});

		mockery.registerMock('fs-extra', {
			existsSync: () => true,
			writeFileSync: () => {},
			mkdirsSync: () => {}
		});

		mockery.registerMock('globby', {
			sync: () => {}
		});

		const run = require('../../src/run').default;

		await run(
			{
				command: {
					renderFiles: 'render files mock'
				}
			},
			{
				name: 'testName'
			}
		);

		assert.deepEqual(createThemeFileStub.firstCall.args, [
			{
				renderFiles: 'render files mock',
				themesDirectory: 'src/themes/testName',
				themedWidgets: [{ themeKey: 'theme-key-1', fileName: 'basename return string' }],
				CSSModuleExtension: '.m.css'
			}
		]);
	});
});
