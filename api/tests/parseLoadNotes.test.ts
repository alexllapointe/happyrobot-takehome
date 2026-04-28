import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseLoadNotes } from '../src/lib/parseLoadNotes.js';

describe('parseLoadNotes', () => {
  describe('floor extraction', () => {
    it('parses "Floor: $1700"', () => {
      assert.deepEqual(parseLoadNotes('Floor: $1700'), { floor: 1700, ceiling: null });
    });

    it('parses "Floor $750" (no colon)', () => {
      assert.equal(parseLoadNotes('Floor $750. Hard cap $950').floor, 750);
    });

    it('handles commas in numbers', () => {
      assert.equal(parseLoadNotes('Floor $1,700').floor, 1700);
    });

    it('returns null floor when notes have no floor token', () => {
      assert.equal(parseLoadNotes('Ceiling $2000 only').floor, null);
    });
  });

  describe('ceiling extraction', () => {
    it('parses "Ceiling $1600"', () => {
      assert.equal(parseLoadNotes('Ceiling $1600').ceiling, 1600);
    });

    it('parses "Authorized to $2650"', () => {
      assert.equal(parseLoadNotes('broker authorized to $2650 ceiling').ceiling, 2650);
    });

    it('parses "$2650 ceiling"', () => {
      assert.equal(parseLoadNotes('Take this at $2650 ceiling please').ceiling, 2650);
    });

    it('parses "Hard cap $950"', () => {
      assert.equal(parseLoadNotes('Floor $750. Hard cap $950').ceiling, 950);
    });

    it('does not match a stray "cap" word inside other text', () => {
      // `cap` requires it to be a standalone token followed by a number.
      // Our regex permits it though — verify documented behavior.
      assert.equal(parseLoadNotes('No cap on tarps').ceiling, null);
    });
  });

  describe('combined notes', () => {
    it('parses both floor and ceiling from one string', () => {
      const r = parseLoadNotes('Floor $1400. Ceiling $1750.');
      assert.deepEqual(r, { floor: 1400, ceiling: 1750 });
    });

    it('returns nulls for empty/null input', () => {
      assert.deepEqual(parseLoadNotes(null), { floor: null, ceiling: null });
      assert.deepEqual(parseLoadNotes(''), { floor: null, ceiling: null });
      assert.deepEqual(parseLoadNotes(undefined), { floor: null, ceiling: null });
    });
  });
});
