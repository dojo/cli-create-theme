import * as mockery from 'mockery';
import * as sinon from 'sinon';

const { describe, it, beforeEach, afterEach } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

describe('questions', () => {
	let sandbox: sinon.SinonSandbox;
	let promptStub: sinon.SinonStub;

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		promptStub = sandbox.stub();
		mockery.enable({ warnOnUnregistered: false, useCleanCache: true });

		mockery.registerMock('inquirer', {
			prompt: promptStub
		});

		mockery.registerMock('path', {
			basename: (str: any) => str
		});
	});

	afterEach(() => {
		sandbox.restore();
		mockery.deregisterAll();
		mockery.resetCache();
		mockery.disable();
	});

	it('can ask for a package name once', async () => {
		promptStub.onCall(0).returns(
			Promise.resolve({
				package: 'package-1',
				askAgain: false
			})
		);

		const { askForPackageNames } = require('../../src/questions');
		const packageNames = await askForPackageNames('some questions');

		assert.equal(promptStub.callCount, 1);
		assert.deepEqual(promptStub.firstCall.args, ['some questions']);
		assert.deepEqual(packageNames, ['package-1']);
	});

	it('can ask for a package name repeatedly', async () => {
		promptStub.onCall(0).returns(
			Promise.resolve({
				package: 'package-1',
				askAgain: true
			})
		);

		promptStub.onCall(1).returns(
			Promise.resolve({
				package: 'package-2',
				askAgain: true
			})
		);

		promptStub.onCall(2).returns(
			Promise.resolve({
				package: 'package-3',
				askAgain: false
			})
		);

		const { askForPackageNames } = require('../../src/questions');
		const packageNames = await askForPackageNames('a question');

		assert.equal(promptStub.callCount, 3);
		assert.deepEqual(promptStub.firstCall.args, ['a question']);
		assert.deepEqual(promptStub.secondCall.args, ['a question']);
		assert.deepEqual(packageNames, ['package-1', 'package-2', 'package-3']);
	});

	it('can provide access to file questions', () => {
		const files = ['file1.extension', 'file2.extension', 'file3.extension'];

		const { getFileQuestions } = require('../../src/questions');
		const [ret] = getFileQuestions('package name', files, '.extension');

		const expected = {
			type: 'checkbox',
			message: 'Which of the package name theme files would you like to scaffold?',
			name: 'files',
			choices: [
				{ name: 'file1', value: 'file1.extension' },
				{ name: 'file2', value: 'file2.extension' },
				{ name: 'file3', value: 'file3.extension' }
			]
		};

		assert.deepEqual(ret, expected);
	});

	it('ask for desired files', async () => {
		promptStub.onCall(0).returns(
			Promise.resolve({
				files: 'some file answers'
			})
		);

		const { askForDesiredFiles } = require('../../src/questions');
		const desiredFiles = await askForDesiredFiles();

		assert.equal(desiredFiles, 'some file answers');
	});
});
