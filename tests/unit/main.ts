import * as mockery from 'mockery';
import * as sinon from 'sinon';

const { beforeEach, afterEach, describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

describe('main', () => {
	beforeEach(() => {
	});

	afterEach(() => {
	});

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

	it('asks the correct questions', async () => {
		mockery.enable({warnOnUnregistered: false});
		mockery.registerAllowable('../../src/main', true);

		const sandbox = sinon.sandbox.create();
		const promptStub: sinon.SinonStub = sandbox.stub();

		promptStub.onCall(0).returns(Promise.resolve({
			package: 'some-package'
		}));

		promptStub.onCall(1).returns(Promise.resolve({
			files: ['some-file-1', 'some-file-2', 'some-file-3']
		}));

		mockery.registerMock('inquirer', {
			prompt: promptStub
		});

		const existsSyncStub: sinon.SinonStub = sandbox.stub();
		existsSyncStub.onFirstCall().returns(true);
		existsSyncStub.onSecondCall().returns(false);

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
		renderFilesStub.returns(async function() {
			return true;
		});

		mockery.registerMock('@dojo/cli-create-app/renderFiles', {
			default: renderFilesStub
		});

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

		const globbySync: sinon.SinonStub = sandbox.stub();
		globbySync.returns([
			'file-1.m.css.js',
			'file-2.m.css.js',
			'file-3.m.css.js'
		]);

		mockery.registerMock('globby', {
			sync: globbySync
		});

		const {run} = (require('../../src/main')).default;

		await run();

		assert.equal(promptStub.callCount, 2);

		assert.deepEqual(promptStub.firstCall.args[0], [{
			type: 'input',
			name: 'package',
			message: 'What Package to do you want to theme?'
		}]);

		assert.deepEqual(promptStub.secondCall.args[0][0], {
			type: 'checkbox',
			message: 'Which of the some-package theme files would you like to scaffold?',
			name: 'files',
			choices: [
				{ name: 'file-1', value: 'file-1.m.css.js' },
				{ name: 'file-2', value: 'file-2.m.css.js' },
				{ name: 'file-3', value: 'file-3.m.css.js' }
			]
		});

		assert.deepEqual(mkdirpStub.callCount, 3);
		assert.deepEqual(mkdirpStub.firstCall.args[0], 'src/themes/some-package/some-file-1');
		assert.deepEqual(mkdirpStub.secondCall.args[0], 'src/themes/some-package/some-file-2');
		assert.deepEqual(mkdirpStub.thirdCall.args[0], 'src/themes/some-package/some-file-3');

		assert.deepEqual(writeFileSyncStub.callCount, 3);

		assert.deepEqual(writeFileSyncStub.firstCall.args, [
			`${process.cwd()}/src/themes/some-package/some-file-1/some-file-1.m.css`,
			'.file-1-key-1 {}\n\n.file-1-key-2 {}\n\n.file-1-key-3 {}'
		]);
		assert.deepEqual(writeFileSyncStub.secondCall.args, [
			`${process.cwd()}/src/themes/some-package/some-file-2/some-file-2.m.css`,
			'.file-2-key-1 {}\n\n.file-2-key-2 {}\n\n.file-2-key-3 {}'
		]);
		assert.deepEqual(writeFileSyncStub.thirdCall.args, [
			`${process.cwd()}/src/themes/some-package/some-file-3/some-file-3.m.css`,
			'.file-3-key-1 {}\n\n.file-3-key-2 {}\n\n.file-3-key-3 {}'
		]);

		assert.equal(renderFilesStub.callCount, 1);
		const [[srcAndDest], templateData] = renderFilesStub.firstCall.args;

		const expectedTemplateData = {
			CSSModules: [{
				path: 'some-package/some-file-1/some-file-1.m.css',
				themeKeyVariable: 'someFile1',
				themeKey: 'some-package/some-file-1'
			}, {
				path: 'some-package/some-file-2/some-file-2.m.css',
				themeKeyVariable: 'someFile2',
				themeKey: 'some-package/some-file-2'
			}, {
				path: 'some-package/some-file-3/some-file-3.m.css',
				themeKeyVariable: 'someFile3',
				themeKey: 'some-package/some-file-3'
		}]};

		assert.deepEqual(templateData, expectedTemplateData);

		assert.deepEqual(srcAndDest, {
			src: `${process.cwd()}/templates/src/theme.ts.ejs`,
			dest: `${process.cwd()}/src/themes/theme.ts`
		});

		sandbox.restore();
		mockery.deregisterAll();
		mockery.resetCache();
		mockery.disable();
	});
});
