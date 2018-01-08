import * as mockery from 'mockery';
import * as sinon from 'sinon';

const { describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

const noopModule = {
	default: () => {}
};

describe('The main runner', () => {
	it(`errors if the package cannot be found`, async () => {
		const sandbox = sinon.sandbox.create();
		const promptStub: sinon.SinonStub = sandbox.stub();

		promptStub.returns(
			Promise.resolve({
				package: 'some-package'
			})
		);

		mockery.enable({ warnOnUnregistered: false, useCleanCache: true });
		mockery.registerMock('inquirer', {
			prompt: promptStub
		});

		const { run } = require('../../src/main').default;

		let errorMessage = '';

		try {
			await run();
		} catch (err) {
			errorMessage = err;
		}

		assert.equal(errorMessage, 'Error: This package path does not exist: node_modules/some-package/theme');

		sandbox.restore();
		mockery.deregisterAll();
		mockery.resetCache();
		mockery.disable();
	});

	it('errors if no widgets selections are made', async () => {
		mockery.enable({ warnOnUnregistered: true, useCleanCache: true });

		const sandbox = sinon.sandbox.create();

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
			writeFileSync: () => {}
		});

		mockery.registerMock('mkdirp', {
			sync: () => {}
		});

		mockery.registerMock('globby', {
			sync: () => {}
		});

		const run = require('../../src/run').default;

		let errorMessage = '';

		try {
			await run();
		} catch (err) {
			errorMessage = err;
		}

		assert.equal(errorMessage, 'Error: No widgets were selected');

		sandbox.restore();
		mockery.deregisterAll();
		mockery.resetCache();
		mockery.disable();
	});

	it('Creates CSS module files', async () => {
		mockery.enable({ warnOnUnregistered: true, useCleanCache: true });

		const sandbox = sinon.sandbox.create();

		const writeFileSyncStub: sinon.SinonStub = sandbox.stub();
		const mkdirpSyncStub: sinon.SinonStub = sandbox.stub();

		const joinStub: sinon.SinonStub = sandbox.stub();

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

		mockery.registerMock('fs-extra', {
			existsSync: () => true,
			writeFileSync: writeFileSyncStub
		});

		mockery.registerMock('mkdirp', {
			sync: mkdirpSyncStub
		});

		mockery.registerMock('globby', {
			sync: () => {}
		});

		const run = require('../../src/run').default;

		await run({
			command: {
				renderFiles: () => {}
			}
		});

		assert.equal(mkdirpSyncStub.callCount, 2);
		assert.deepEqual(mkdirpSyncStub.firstCall.args, ['src/themes/theme-key-1']);
		assert.deepEqual(mkdirpSyncStub.secondCall.args, ['src/themes/theme-key-2']);

		assert.equal(writeFileSyncStub.callCount, 2);
		assert.deepEqual(writeFileSyncStub.firstCall.args, ['new/file/path-1', 'css file contents']);
		assert.deepEqual(writeFileSyncStub.secondCall.args, ['new/file/path-2', 'css file contents']);

		sandbox.restore();
		mockery.deregisterAll();
		mockery.resetCache();
		mockery.disable();
	});

	it('Creates a theme file', async () => {
		mockery.enable({ warnOnUnregistered: true, useCleanCache: true });

		const sandbox = sinon.sandbox.create();

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
			writeFileSync: () => {}
		});

		mockery.registerMock('mkdirp', {
			sync: () => {}
		});

		mockery.registerMock('globby', {
			sync: () => {}
		});

		const run = require('../../src/run').default;

		await run({
			command: {
				renderFiles: 'render files mock'
			}
		});

		assert.deepEqual(createThemeFileStub.firstCall.args, [
			{
				renderFiles: 'render files mock',
				themesDirectory: 'src/themes',
				themedWidgets: [{ themeKey: 'theme-key-1', fileName: 'basename return string' }],
				CSSModuleExtension: '.m.css'
			}
		]);

		sandbox.restore();
		mockery.deregisterAll();
		mockery.resetCache();
		mockery.disable();
	});
});
