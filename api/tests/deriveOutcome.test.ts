import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { deriveOutcome } from '../src/services/callsService.js';

describe('deriveOutcome — every classification → enum mapping', () => {
  it('booked from "Success"', () => {
    assert.equal(deriveOutcome('Success'), 'booked');
  });

  it('booked from common typo "Sucess"', () => {
    assert.equal(deriveOutcome('Sucess'), 'booked');
  });

  it('booked from labels with punctuation: "Success!"', () => {
    assert.equal(deriveOutcome('Success!'), 'booked');
  });

  it('booked from snake_case label: "success_outcome"', () => {
    assert.equal(deriveOutcome('success_outcome'), 'booked');
  });

  it('booked from "booked"', () => {
    assert.equal(deriveOutcome('booked'), 'booked');
  });

  it('carrier_ineligible from "MC ineligible"', () => {
    assert.equal(deriveOutcome('MC ineligible'), 'carrier_ineligible');
  });

  it('carrier_ineligible from "not authorized"', () => {
    assert.equal(deriveOutcome('Carrier not authorized'), 'carrier_ineligible');
  });

  it('carrier_ineligible from "Inactive"', () => {
    assert.equal(deriveOutcome('Inactive carrier'), 'carrier_ineligible');
  });

  it('no_matching_load from "No match"', () => {
    assert.equal(deriveOutcome('No match found'), 'no_matching_load');
  });

  it('no_matching_load from "no load"', () => {
    assert.equal(deriveOutcome('Carrier asked but no load available'), 'no_matching_load');
  });

  it('no_agreement from "Rate too high"', () => {
    assert.equal(deriveOutcome('Rate too high'), 'no_agreement');
  });

  it('declined_by_carrier from "Not interested"', () => {
    assert.equal(deriveOutcome('Not interested'), 'declined_by_carrier');
  });

  it('declined_by_carrier from "Declined"', () => {
    assert.equal(deriveOutcome('Declined'), 'declined_by_carrier');
  });

  it('abandoned from "Abandoned call"', () => {
    assert.equal(deriveOutcome('Abandoned call'), 'abandoned');
  });

  it('null for empty / null / whitespace classification', () => {
    assert.equal(deriveOutcome(null), null);
    assert.equal(deriveOutcome(''), null);
    assert.equal(deriveOutcome('   '), null);
  });

  it('null for unrecognized classification', () => {
    assert.equal(deriveOutcome('frog hat'), null);
  });

  it('matches priority: ineligible/inactive beats "rate" if both terms present', () => {
    // The current rule order: success → ineligible → no match → rate →
    // declined → abandoned. So "Inactive due to rate dispute" → ineligible.
    assert.equal(deriveOutcome('Inactive due to rate dispute'), 'carrier_ineligible');
  });
});
