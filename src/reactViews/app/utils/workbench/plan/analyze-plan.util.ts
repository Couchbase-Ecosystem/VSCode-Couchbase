/* eslint-disable no-param-reassign */
import { Lists } from 'types/plan';
import n1ql from './n1ql';

export function convertTimeStringToFloat(timeValue: string) {
  // regex for parsing time values like 3m23.7777s or 234.9999ms or 3.8888s
  // groups: 1: minutes, 2: secs, 3: millis, 4: microseconds
  const durationExpr = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+\.\d+)s)?(?:(\d+\.\d+)ms)?(?:(\d+\.\d+)µs)?/;
  let result = 0.0;

  const timeUnit = timeValue.match(durationExpr);

  if (timeUnit) {
    // minutes
    if (timeUnit[1])
      // hours value
      result += parseInt(timeUnit[1], 10) * 3600;

    if (timeUnit[2])
      // minutes value
      result += parseInt(timeUnit[2], 10) * 60;

    // seconds
    if (timeUnit[3]) result += parseFloat(timeUnit[3]);

    // milliseconds
    if (timeUnit[4]) result += parseFloat(timeUnit[4]) / 1000;

    // microseconds
    if (timeUnit[5]) result += parseFloat(timeUnit[5]) / 1000000;
  }

  return result;
}

export function convertTimeFloatToFormattedString(timeValue: number) {
  let minutes = 0;
  if (timeValue > 60) minutes = Math.floor(timeValue / 60);
  const seconds = timeValue - minutes * 60;

  let minutesStr = minutes.toString();
  if (minutesStr.length < 2) minutesStr = `0${minutesStr}`;

  let secondsStr = (seconds < 10 ? '0' : '') + seconds.toString();
  if (secondsStr.length > 7) secondsStr = secondsStr.substring(0, 6);

  return `${minutesStr}:${secondsStr}`;
}

export function getFieldsFromExpressionWithParser(expression: string, lists: Lists) {
  try {
    const parseTree = n1ql.parse(expression);

    // parse tree has array of array of strings, we will build
    if (parseTree)
      for (let p = 0; p < parseTree.length; p++) {
        if (parseTree[p].pathsUsed)
          for (let j = 0; j < parseTree[p].pathsUsed.length; j++) {
            if (parseTree[p].pathsUsed[j]) {
              let field = '';
              let k;
              for (k = 0; k < parseTree[p].pathsUsed[j].length; k++) {
                let pathElement = parseTree[p].pathsUsed[j][k];

                // check for bucket aliases
                if (k === 0 && lists.aliases)
                  for (let a = 0; a < lists.aliases.length; a++)
                    if (lists.aliases[a].as === pathElement) {
                      pathElement = lists.aliases[a].keyspace;
                      break;
                    }

                // first item in path should go into buckets
                if (k === 0) lists.buckets[pathElement] = true;

                field += (k > 0 && pathElement !== '[]' ? '.' : '') + pathElement;
              }

              if (k > 1) lists.fields[field] = true;
            }
          }
      }
  } catch (e: unknown) {
    // FIXME/TODO: Are these console logs supposed to be here?
    // console.log(`Error parsing: ${expression}`);
    // console.log(`Error: ${e}`);
  }
}
