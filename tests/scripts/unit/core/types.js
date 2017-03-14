import { $copy, $equals, $extend, $isArray, $isFunction, $isNumber, $isObject, $isString, $serialize, $toArray, $type, $unserialize } from 'core/types';

describe('Core: Types', () => {
	describe('$copy', () => {
		it('should clone object', () => {
			let obj = {a: 1, b: 2};

			expect($copy(obj)).to.not.equal(obj);
			expect($copy(obj)).to.deep.equal(obj);
		});

		it('should clone array', () => {
			let arr = [0, 1];

			expect($copy(arr)).to.not.equal(arr);
			expect($copy(arr)).to.deep.equal(arr);
		});
	});

	describe('$equals', () => {
		it('should determine equality of strings', () => {
			expect($equals('a', 'a')).to.be.true;
			expect($equals('a', 'b')).to.be.false;
		});

		it('should determine equality of numbers', () => {
			expect($equals(2, 2)).to.be.true;
			expect($equals(2, 3)).to.be.false;
		});

		it('should determine equality of objects', () => {
			expect($equals({prop: 1}, {prop: 1})).to.be.true;
			expect($equals({prop: 1}, {prop: 2})).to.be.false;
		});

		it('should determine equality of arrays', () => {
			expect($equals([0, 1], [0, 1])).to.be.true;
			expect($equals([0, 1], [0, 2])).to.be.false;
		});

		it('should determine equality of dates', () => {
			let date = new Date();

			expect($equals(date, date)).to.be.true;
			expect($equals(date, new Date(2016))).to.be.false;
		});
	});

	describe('$extend', () => {
		it('should extend two objects', () => {
			let a = {prop: 1, prop2: 3},
				b = {prop: 2};

			expect(JSON.stringify($extend(a, b))).to.equal('{"prop":2,"prop2":3}');
		});

		it('should deeply extend objects', () => {
			let a = {prop: 1, prop2: {inner: true}, prop3: [0, 1]},
				b = {prop: 2, prop2: {inner: false}, prop3: [1]};

			expect(JSON.stringify($extend(true, a, b))).to.equal('{"prop":2,"prop2":{"inner":false},"prop3":[1]}');
		});

		it('should deeply extend variable number of objects', () => {
			let a = {prop: 1, prop2: 3},
				b = {prop: 2},
				c = {prop: 3};

			expect(JSON.stringify($extend(a, b, c))).to.equal('{"prop":3,"prop2":3}');
		});
	});

	describe('$isArray', () => {
		it('should identify array', () => {
			expect($isArray([])).to.be.true;
			expect($isArray({})).to.be.false;
		});
	});

	describe('$isFunction', () => {
		it('should identify functions', () => {
			expect($isFunction(function(){})).to.be.true;
			expect($isArray({})).to.be.false;
		});
	});

	describe('$isNumber', () => {
		it('should identify numbers', () => {
			expect($isNumber(1)).to.be.true;
			expect($isNumber('1')).to.be.false;
		});

		it('should identify string number as number when not strict', () => {
			expect($isNumber('1', false)).to.be.true;
			expect($isNumber('test', false)).to.be.false;
			expect($isNumber('1test', false)).to.be.true;
		});
	});

	describe('$isObject', () => {
		it('should identify objects', () => {
			expect($isObject({})).to.be.true;
			expect($isObject([])).to.be.false;
		});
	});

	describe('$isString', () => {
		it('should identify strings', () => {
			expect($isString('string')).to.be.true;
			expect($isString('1')).to.be.true;
			expect($isString(1)).to.be.false;
		});
	});

	describe('$serialize', () => {
		it('should serialize flat object', () => {
			let obj = {a: 1, b: 2, c: 3, d: [0, 1]};

			expect($serialize(obj)).to.equal('a=1&b=2&c=3&d[]=0&d[]=1');
		});
	});

	describe('$toArray', () => {
		it('should wrap value in array if not array', () => {
			expect($toArray('test')).to.deep.equal(['test']);
		});

		it('should return same array if array passed', () => {
			let arr = [0, 1];

			expect($toArray(arr)).to.equal(arr);
		});

		it('should return empty array if undefined', () => {
			expect($toArray()).to.deep.equal([]);
		});
	});

	describe('$type', () => {
		it('should identify objects', () => {
			expect($type({})).to.equal('object');
		});

		it('should identify functions', () => {
			expect($type(function(){})).to.equal('function');
		});

		it('should identify arrays', () => {
			expect($type([])).to.equal('array');
		});

		it('should identify strings', () => {
			expect($type('string')).to.equal('string');
		});

		it('should identify numbers', () => {
			expect($type(10)).to.equal('number');
			expect($type(0.234)).to.equal('number');
			expect($type(NaN)).to.equal('number');
		});

		it('should identify null', () => {
			expect($type(null)).to.equal('null');
		});

		it('should identify undefined', () => {
			expect($type(undefined)).to.equal('undefined');
		});

		it('should identify symbols', () => {
			expect($type(Symbol())).to.equal('symbol');
		});
	});

	describe('$unserialize', () => {
		it('should convert serialized string back to object', () => {
			expect($unserialize('a=1&b=2&c=3&d[]=0&d[]=1')).to.deep.equal({a: 1, b: 2, c: 3, d: [0, 1]});
		});
	});
});