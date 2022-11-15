/* tslint:disable */
/* eslint-disable */
/**
* @param {string} x
* @param {string} y
* @returns {string}
*/
export function pedersen(x: string, y: string): string;
/**
* @param {Uint8Array} x
* @param {Uint8Array} y
* @returns {string}
*/
export function og_pedersen(x: Uint8Array, y: Uint8Array): string;
/**
*/
export enum Error {
  EmptyDataError,
  OverflowError,
  IncorrectLenError,
  IOError,
  TypeError,
  UnsignableMessage,
}
