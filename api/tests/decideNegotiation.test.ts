import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { decideNegotiation } from '../src/services/negotiationService.js';

// Standard fixture: posted $1850, ceiling $2035 (≈ 10% above posted).
// Reject threshold: ceiling × 1.15 = $2340.25.
const POSTED = 1850;
const CEILING = 2035;

describe('decideNegotiation', () => {
  describe('offer ≤ posted: instant accept', () => {
    it('accepts a low-ball offer at the offer amount', () => {
      const r = decideNegotiation({ posted: POSTED, ceiling: CEILING, offer: 1700, round: 1 });
      assert.deepEqual(r, { decision: 'accept', agreed_rate: 1700 });
    });

    it('accepts when offer equals posted', () => {
      const r = decideNegotiation({ posted: POSTED, ceiling: CEILING, offer: POSTED, round: 1 });
      assert.deepEqual(r, { decision: 'accept', agreed_rate: POSTED });
    });
  });

  describe('posted < offer ≤ ceiling: negotiable zone', () => {
    it('round 1: counters at midpoint of (posted, offer), rounded to $25', () => {
      // (1850 + 2000) / 2 = 1925, rounded → 1925
      const r = decideNegotiation({ posted: POSTED, ceiling: CEILING, offer: 2000, round: 1 });
      assert.deepEqual(r, { decision: 'counter', counter_rate: 1925 });
    });

    it('round 2: counters at midpoint', () => {
      const r = decideNegotiation({ posted: POSTED, ceiling: CEILING, offer: 1950, round: 2 });
      // (1850 + 1950) / 2 = 1900
      assert.deepEqual(r, { decision: 'counter', counter_rate: 1900 });
    });

    it('round 3: accepts the offer (final-round close)', () => {
      const r = decideNegotiation({ posted: POSTED, ceiling: CEILING, offer: 2000, round: 3 });
      assert.deepEqual(r, { decision: 'accept', agreed_rate: 2000 });
    });

    it('counter never exceeds offer − 25 (so it is genuinely a step down)', () => {
      // For a tiny gap above posted, midpoint could come close to offer.
      // Posted 1850, offer 1875 → midpoint 1862.5 → 1875, but counter must
      // be ≤ offer − 25 = 1850. So counter = 1850.
      const r = decideNegotiation({ posted: POSTED, ceiling: CEILING, offer: 1875, round: 1 });
      assert.deepEqual(r, { decision: 'counter', counter_rate: 1850 });
    });
  });

  describe('ceiling < offer ≤ ceiling × 1.15: hold the line', () => {
    it('round 1: counters at the ceiling', () => {
      // Offer 2200 is between 2035 and 2340.25
      const r = decideNegotiation({ posted: POSTED, ceiling: CEILING, offer: 2200, round: 1 });
      assert.deepEqual(r, { decision: 'counter', counter_rate: CEILING });
    });

    it('round 3: rejects (rounds spent)', () => {
      const r = decideNegotiation({ posted: POSTED, ceiling: CEILING, offer: 2200, round: 3 });
      assert.deepEqual(r, { decision: 'reject', reason: 'over_ceiling' });
    });
  });

  describe('offer > ceiling × 1.15: reject any round', () => {
    it('round 1: rejects', () => {
      const r = decideNegotiation({ posted: POSTED, ceiling: CEILING, offer: 2500, round: 1 });
      assert.deepEqual(r, { decision: 'reject', reason: 'over_ceiling' });
    });

    it('round 2: rejects', () => {
      const r = decideNegotiation({ posted: POSTED, ceiling: CEILING, offer: 2500, round: 2 });
      assert.deepEqual(r, { decision: 'reject', reason: 'over_ceiling' });
    });
  });

  describe('boundary at exactly ceiling × 1.15', () => {
    it('exactly at threshold counters (not rejects)', () => {
      // 2340.25 — overage = 0.15 exactly, NOT > 0.15.
      const r = decideNegotiation({ posted: POSTED, ceiling: CEILING, offer: 2340.25, round: 1 });
      assert.equal(r.decision, 'counter');
    });

    it('a fraction above threshold rejects', () => {
      const r = decideNegotiation({ posted: POSTED, ceiling: CEILING, offer: 2341, round: 1 });
      assert.equal(r.decision, 'reject');
    });
  });
});
