import * as mockery from 'mockery';
import * as sinon from 'sinon';

const { describe, it, beforeEach, afterEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

describe('create theme file', () => {
	let sandbox: sinon.SinonSandbox;
	let joinStub: sinon.SinonStub;
	let renderFilesStub: sinon.SinonStub;
	let createThemeFileConfig: any;

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		joinStub = sandbox.stub();
		renderFilesStub = sandbox.stub();

		createThemeFileConfig = {
			themesDirectory: 'path/to/theme/directory',
			themedWidgets: [{ themeKey: 'theme-key', fileName: 'some-file-name' }],
			CSSModuleExtension: '.ext',
			renderFiles: renderFilesStub
		};

		mockery.enable({ warnOnUnregistered: false, useCleanCache: true });
		mockery.registerMock('path', {
			join: joinStub
		});

		mockery.registerMock('pkg-dir', {
			sync: () => {}
		});
	});

	afterEach(() => {
		sandbox.restore();
		mockery.deregisterAll();
		mockery.resetCache();
		mockery.disable();
	});

	it('creates a new theme file', () => {
		joinStub.onCall(0).returns('dest/file/path');
		joinStub.onCall(1).returns('path/to/src');

		mockery.registerMock('camelcase', () => 'camelcased');

		mockery.registerMock('fs-extra', {
			existsSync: () => false
		});

		const createThemeFile = require('../../src/createThemeFile').default;
		createThemeFile(createThemeFileConfig);

		const [[files], data] = renderFilesStub.firstCall.args;

		assert.equal(renderFilesStub.callCount, 1);
		assert.deepEqual(files, {
			src: 'path/to/src',
			dest: 'dest/file/path'
		});

		assert.deepEqual(data.CSSModules, [
			{
				path: 'theme-key/some-file-name.ext',
				themeKeyVariable: 'camelcased',
				themeKey: 'theme-key'
			}
		]);
	});

	it('does not create a new theme file if one already exists', () => {
		const renderFilesStub: sinon.SinonStub = sandbox.stub();

		mockery.registerMock('camelcase', () => {});

		mockery.registerMock('fs-extra', {
			existsSync: () => true
		});

		const createThemeFile = require('../../src/createThemeFile').default;
		createThemeFile(createThemeFileConfig);

		assert.equal(renderFilesStub.callCount, 0);
	});
});
