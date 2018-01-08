import * as mockery from 'mockery';
import * as sinon from 'sinon';

const { describe, it } = intern.getInterface('bdd');
const { assert } = intern.getPlugin('chai');

describe('questions', () => {
	it('can ask for a package name once', async () => {
		const sandbox = sinon.sandbox.create();
		const promptStub: sinon.SinonStub = sandbox.stub();

		promptStub.onCall(0).returns(
			Promise.resolve({
				package: 'package-1',
				askAgain: false
			})
		);

		mockery.enable({ warnOnUnregistered: false, useCleanCache: true });
		mockery.registerMock('inquirer', {
			prompt: promptStub
		});

		const { askForPackageNames } = require('../../src/questions');

		const returnVal = await askForPackageNames('some questions');

		assert.equal(promptStub.callCount, 1);
		assert.deepEqual(promptStub.firstCall.args, ['some questions']);
		assert.deepEqual(returnVal, ['package-1']);

		sandbox.restore();
		mockery.deregisterAll();
		mockery.resetCache();
		mockery.disable();
	});

	it('can ask for a package name many times', async () => {
		const sandbox = sinon.sandbox.create();
		const promptStub: sinon.SinonStub = sandbox.stub();

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

		mockery.enable({ warnOnUnregistered: false, useCleanCache: true });
		mockery.registerMock('inquirer', {
			prompt: promptStub
		});

		const { askForPackageNames } = require('../../src/questions');

		const returnVal = await askForPackageNames('a question');

		assert.equal(promptStub.callCount, 3);
		assert.deepEqual(promptStub.firstCall.args, ['a question']);
		assert.deepEqual(promptStub.secondCall.args, ['a question']);

		assert.deepEqual(returnVal, ['package-1', 'package-2', 'package-3']);

		sandbox.restore();
		mockery.deregisterAll();
		mockery.resetCache();
		mockery.disable();
	});

	it('can provide access to file questions', () => {
		const sandbox = sinon.sandbox.create();

		mockery.enable({ warnOnUnregistered: false, useCleanCache: true });
		mockery.registerMock('inquirer', {});
		mockery.registerMock('path', {
			basename: (str: any) => str
		});

		const { getFileQuestions } = require('../../src/questions');

		const files = ['file1.extension', 'file2.extension', 'file3.extension'];

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

		sandbox.restore();
		mockery.deregisterAll();
		mockery.resetCache();
		mockery.disable();
	});

	it('ask for desired files', async () => {
		const sandbox = sinon.sandbox.create();
		const promptStub: sinon.SinonStub = sandbox.stub();

		promptStub.onCall(0).returns(
			Promise.resolve({
				files: 'some file answers'
			})
		);

		mockery.enable({ warnOnUnregistered: false, useCleanCache: true });
		mockery.registerMock('inquirer', {
			prompt: promptStub
		});

		const { askForDesiredFiles } = require('../../src/questions');

		const returnVal = await askForDesiredFiles();

		assert.equal(returnVal, 'some file answers');

		sandbox.restore();
		mockery.deregisterAll();
		mockery.resetCache();
		mockery.disable();
	});
});
