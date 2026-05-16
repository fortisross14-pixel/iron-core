/**
 * BACK-COMPAT shim. The real data is in /data/coaches.ts.
 * Existing imports of '../data/trainers' continue to work.
 * New code should import from '../data/coaches'.
 */
export * from './coaches';
