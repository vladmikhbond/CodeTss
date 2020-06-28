

const assert = require('assert');
const dif = require('../../src/text_difference');

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require('vscode');
// const myExtension = require('../extension');

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Test_0', () => {
		let t1 = '11111111111111111111111111111111111111111111111111111111111111111111';
		let t2 = '111111111\r\n1111111"aa"1111111111"111"11111111111bbbbb11111\n111211111111';
		let ps = dif.changes(t1, t2, 5);
		assert.equal(t2, dif.restore(t1, ps));
	});
	
	test('Test_1', () => {
		let t1 = '111111111111111111';
		let t2 = '1111111"22222"111111';
		let ps = dif.changes(t1, t2, 5);
		assert.equal(t2, dif.restore(t1, ps));
	});

	test('Test_2', () => {
		let t1 = '111111111111111111';
		let t2 = '1111111\n11111111111';
		let ps = dif.changes(t1, t2, 5);
		assert.equal(t2, dif.restore(t1, ps));
	});

	test('Test_3', () => {
		let t1 = '111111111111111111';
		let t2 = '1111111\n,,,111\n111\n11111';
		let ps = dif.changes(t1, t2, 5);
		assert.equal(t2, dif.restore(t1, ps));
	});


});

