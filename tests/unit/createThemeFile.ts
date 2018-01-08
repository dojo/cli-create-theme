import * as mockery from 'mockery';
import * as sinon from 'sinon';

const { describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

describe('create theme file', () => {
	it('creates a new theme file', () => {
		const sandbox = sinon.sandbox.create();
		const renderFilesStub: sinon.SinonStub = sandbox.stub();
		const joinStub: sinon.SinonStub = sandbox.stub();

		joinStub.onCall(0).returns('dest/file/path');
		joinStub.onCall(1).returns('path/to/src');

		mockery.enable({ warnOnUnregistered: false, useCleanCache: true });
		mockery.registerMock('path', {
			join: joinStub
		});

		mockery.registerMock('camelcase', () => 'camelcased');

		mockery.registerMock('fs-extra', {
			existsSync: () => false
		});

		mockery.registerMock('pkg-dir', {
			sync: () => {}
		});

		const createThemeFile = require('../../src/createThemeFile').default;

		createThemeFile({
			themesDirectory: 'path/to/theme/directory',
			themedWidgets: [{ themeKey: 'theme-key', fileName: 'some-file-name' }],
			CSSModuleExtension: '.ext',
			renderFiles: renderFilesStub
		});

		assert.equal(renderFilesStub.callCount, 1);

		const [[files], data] = renderFilesStub.firstCall.args;

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

		sandbox.restore();
		mockery.deregisterAll();
		mockery.resetCache();
		mockery.disable();
	});

	it('does not creates a new theme file if one already exists', () => {
		const sandbox = sinon.sandbox.create();

		const renderFilesStub: sinon.SinonStub = sandbox.stub();
		mockery.enable({ warnOnUnregistered: false, useCleanCache: true });
		mockery.registerMock('path', {
			join: () => {}
		});

		mockery.registerMock('camelcase', () => {});

		mockery.registerMock('fs-extra', {
			existsSync: () => true
		});

		mockery.registerMock('pkg-dir', {
			sync: () => {}
		});

		const createThemeFile = require('../../src/createThemeFile').default;

		createThemeFile({
			themesDirectory: 'path/to/theme/directory',
			themedWidgets: [{ themeKey: 'theme-key', fileName: 'some-file-name' }],
			CSSModuleExtension: '.ext',
			renderFiles: renderFilesStub
		});

		assert.equal(renderFilesStub.callCount, 0);

		sandbox.restore();
		mockery.deregisterAll();
		mockery.resetCache();
		mockery.disable();
	});
});
