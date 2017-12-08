import * as mockery from 'mockery';
import * as sinon from 'sinon';

const { beforeEach, afterEach, describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

describe('main', () => {
	it('errors if the package cannot be found', async () => {
		const sandbox = sinon.sandbox.create();
		const promptStub: sinon.SinonStub = sandbox.stub();

		promptStub.returns(Promise.resolve({
			package: 'some-package'
		}));

		mockery.enable({warnOnUnregistered: false, useCleanCache: true});
		mockery.registerMock('inquirer', {
			prompt: promptStub
		});

		const {run} = (require('../../src/main')).default;

		try {
			await run();
		} catch (err) {
			assert.equal(err, 'Error: This package path does not exist: node_modules/some-package/theme');
		}

		sandbox.restore();
		mockery.deregisterAll();
		mockery.resetCache();
		mockery.disable();
	});

	it('creates css modules and a theme file', async () => {
		mockery.enable({warnOnUnregistered: false});
		mockery.registerAllowable('../../src/main', true);

		const sandbox = sinon.sandbox.create();
		const promptStub: sinon.SinonStub = sandbox.stub();

		promptStub.onCall(0).returns(Promise.resolve({
			package: 'some-package-1',
			askAgain: true
		}));

		promptStub.onCall(1).returns(Promise.resolve({
			package: 'some-package-2',
			askAgain: false
		}));

		promptStub.onCall(2).returns(Promise.resolve({
			files: ['some-file-1', 'some-file-2', 'some-file-3']
		}));

		promptStub.onCall(3).returns(Promise.resolve({
			files: ['some-file-9']
		}));

		mockery.registerMock('inquirer', {
			prompt: promptStub
		});

		const existsSyncStub: sinon.SinonStub = sandbox.stub();
		existsSyncStub.onFirstCall().returns(true);
		existsSyncStub.onSecondCall().returns(true);
		existsSyncStub.onThirdCall().returns(false);

		const writeFileSyncStub: sinon.SinonStub = sandbox.stub();

		mockery.registerMock('fs-extra', {
			existsSync: existsSyncStub,
			writeFileSync: writeFileSyncStub
		});

		const mkdirpStub: sinon.SinonStub = sandbox.stub();
		mkdirpStub.returns(true);

		mockery.registerMock('mkdirp', {
			sync: mkdirpStub
		});

		const renderFilesStub: sinon.SinonStub = sandbox.stub();
		renderFilesStub.returns(function() {});

		mockery.registerMock(`${process.cwd()}/some-file-1`, {
			['file-1-key-1']: 'value 1',
			['file-1-key-2']: 'value 2',
			['file-1-key-3']: 'value 3'
		});

		mockery.registerMock(`${process.cwd()}/some-file-2`, {
			['file-2-key-1']: 'value 1',
			['file-2-key-2']: 'value 2',
			['file-2-key-3']: 'value 3'
		});

		mockery.registerMock(`${process.cwd()}/some-file-3`, {
			['file-3-key-1']: 'value 1',
			['file-3-key-2']: 'value 2',
			['file-3-key-3']: 'value 3'
		});

		mockery.registerMock(`${process.cwd()}/some-file-9`, {
			['file-9-key-1']: 'value 1'
		});

		const globbySyncStub: sinon.SinonStub = sandbox.stub();

		globbySyncStub.onCall(0).returns([
			'file-1.m.css.js',
			'file-2.m.css.js',
			'file-3.m.css.js'
		]);

		globbySyncStub.onCall(1).returns([
			'file-9.m.css.js'
		]);

		mockery.registerMock('globby', {
			sync: globbySyncStub
		});

		const {run} = (require('../../src/main')).default;

		await run({
			command: {
				renderFiles: renderFilesStub
			}
		});

		assert.equal(promptStub.callCount, 4, 'The user was prompted the correct amount of times');

		const packageQuestion = [{
			type: 'input',
			name: 'package',
			message: 'What Package to do you want to theme?'
		}, {
			default: true,
			message: 'Any more?',
			name: 'askAgain',
			type: 'confirm'
		}];

		assert.deepEqual(promptStub.firstCall.args[0], packageQuestion);
		assert.deepEqual(promptStub.secondCall.args[0], packageQuestion);

		assert.deepEqual(promptStub.thirdCall.args[0][0], {
			type: 'checkbox',
			message: 'Which of the some-package-1 theme files would you like to scaffold?',
			name: 'files',
			choices: [
				{ name: 'file-1', value: 'file-1.m.css.js' },
				{ name: 'file-2', value: 'file-2.m.css.js' },
				{ name: 'file-3', value: 'file-3.m.css.js' }
			]
		});

		assert.deepEqual(promptStub.getCall(3).args[0][0], {
			type: 'checkbox',
			message: 'Which of the some-package-2 theme files would you like to scaffold?',
			name: 'files',
			choices: [{
				name: 'file-9', value: 'file-9.m.css.js'
			}]
		});

		assert.equal(mkdirpStub.callCount, 4, 'mkdir was called once per widget');
		assert.deepEqual(mkdirpStub.getCall(0).args[0], 'src/themes/some-package-1/some-file-1');
		assert.deepEqual(mkdirpStub.getCall(1).args[0], 'src/themes/some-package-1/some-file-2');
		assert.deepEqual(mkdirpStub.getCall(2).args[0], 'src/themes/some-package-1/some-file-3');
		assert.deepEqual(mkdirpStub.getCall(3).args[0], 'src/themes/some-package-2/some-file-9');

		assert.deepEqual(writeFileSyncStub.callCount, 4, 'write file was called once per widget');

		assert.deepEqual(writeFileSyncStub.getCall(0).args, [
			`${process.cwd()}/src/themes/some-package-1/some-file-1/some-file-1.m.css`,
			'.file-1-key-1 {}\n\n.file-1-key-2 {}\n\n.file-1-key-3 {}'
		]);

		assert.deepEqual(writeFileSyncStub.getCall(1).args, [
			`${process.cwd()}/src/themes/some-package-1/some-file-2/some-file-2.m.css`,
			'.file-2-key-1 {}\n\n.file-2-key-2 {}\n\n.file-2-key-3 {}'
		]);

		assert.deepEqual(writeFileSyncStub.getCall(2).args, [
			`${process.cwd()}/src/themes/some-package-1/some-file-3/some-file-3.m.css`,
			'.file-3-key-1 {}\n\n.file-3-key-2 {}\n\n.file-3-key-3 {}'
		]);

		assert.deepEqual(writeFileSyncStub.getCall(3).args, [
			`${process.cwd()}/src/themes/some-package-2/some-file-9/some-file-9.m.css`,
			'.file-9-key-1 {}'
		]);

		assert.equal(renderFilesStub.callCount, 1);
		const [[srcAndDest], templateData] = renderFilesStub.firstCall.args;

		const expectedTemplateData = {
			CSSModules: [{
				path: 'some-package-1/some-file-1/some-file-1.m.css',
				themeKeyVariable: 'someFile1',
				themeKey: 'some-package-1/some-file-1'
			}, {
				path: 'some-package-1/some-file-2/some-file-2.m.css',
				themeKeyVariable: 'someFile2',
				themeKey: 'some-package-1/some-file-2'
			}, {
				path: 'some-package-1/some-file-3/some-file-3.m.css',
				themeKeyVariable: 'someFile3',
				themeKey: 'some-package-1/some-file-3'
			}, {
				path: 'some-package-2/some-file-9/some-file-9.m.css',
				themeKey: 'some-package-2/some-file-9',
				themeKeyVariable: 'someFile9'
			}]};

		assert.deepEqual(templateData, expectedTemplateData);

		assert.deepEqual(srcAndDest, {
			src: `${process.cwd()}/templates/src/theme.ts.ejs`,
			dest: `${process.cwd()}/src/themes/theme.ts`
		});

		assert.isTrue(existsSyncStub.calledAfter(promptStub), 'fs exists was called after the user was prompted');
		assert.isTrue(globbySyncStub.calledAfter(existsSyncStub), 'A glob was matched after exists sync');
		assert.isTrue(mkdirpStub.calledAfter(globbySyncStub), 'Directory for css module is created after scanning for CSS modules');
		assert.isTrue(writeFileSyncStub.calledAfter(mkdirpStub), 'CSS module file is written after the directory is created');
		assert.isTrue(renderFilesStub.calledAfter(writeFileSyncStub), 'Theme file is written after the CSS modules');

		sandbox.restore();
		mockery.deregisterAll();
		mockery.resetCache();
		mockery.disable();
	});
});
