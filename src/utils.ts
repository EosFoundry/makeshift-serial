import { stat } from "fs";

let quiet = false;
let logger = console.log;

export function strfy(o) { return JSON.stringify(o, null, 2) }

export function setLogger(newLogger: typeof console.log) { logger = newLogger }

export function resetLogger() { logger = console.log }

export function setQuiet(state: boolean) { quiet = state }

export function Msg(n) {
  const name = n;
  return (loggable) => {
    if (quiet === false) {
      console.log(`${name} ==> `)
      console.log(loggable)
    }
  }
};
