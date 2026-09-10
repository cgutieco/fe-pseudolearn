const REGEX_ALLOWED_BEFORE = new Set([
  '=',
  '(',
  ',',
  ':',
  '[',
  '!',
  '&',
  '|',
  '?',
  '{',
  '}',
  ';',
  '+',
  '*',
  '\n',
]);
const QUOTES = new Set(['"', "'", '`']);

export function findJavaScriptComments(source) {
  const comments = [];
  const state = { index: 0, line: 1, lastMeaningful: '\n' };
  while (state.index < source.length) {
    advance(source, state, comments);
  }
  return comments;
}

function advance(source, state, comments) {
  const character = source[state.index];
  const next = source[state.index + 1];

  if (character === '\n') {
    state.line += 1;
    state.index += 1;
    state.lastMeaningful = '\n';
    return;
  }
  if (character === '/' && (next === '/' || next === '*')) {
    Object.assign(state, consumeComment(source, { ...state, isBlock: next === '*' }, comments));
    return;
  }
  if (QUOTES.has(character) || (character === '/' && REGEX_ALLOWED_BEFORE.has(state.lastMeaningful))) {
    const end = consumeQuoted(source, state.index, character);
    state.line += countNewlines(source.slice(state.index, end));
    state.index = end;
    state.lastMeaningful = character;
    return;
  }
  if (character.trim() !== '') state.lastMeaningful = character;
  state.index += 1;
}

function consumeComment(source, cursor, comments) {
  const opening = cursor.index + 2;
  const terminator = cursor.isBlock ? '*/' : '\n';
  const found = source.indexOf(terminator, opening);
  const stop = found === -1 ? source.length : found;
  comments.push({ line: cursor.line, text: source.slice(opening, stop) });
  return {
    line: cursor.line + countNewlines(source.slice(cursor.index, stop)),
    index: cursor.isBlock ? stop + 2 : stop,
  };
}

function consumeQuoted(source, startIndex, terminator) {
  let index = startIndex + 1;
  while (index < source.length) {
    if (source[index] === '\\') {
      index += 2;
      continue;
    }
    if (source[index] === terminator) return index + 1;
    if (terminator === '/' && source[index] === '\n') return index;
    index += 1;
  }
  return source.length;
}

export function findCssComments(source) {
  const comments = [];
  const state = { index: 0, line: 1 };
  while (state.index < source.length) {
    advanceCss(source, state, comments);
  }
  return comments;
}

function advanceCss(source, state, comments) {
  const character = source[state.index];
  if (character === '\n') {
    state.line += 1;
    state.index += 1;
    return;
  }
  if (character === '/' && source[state.index + 1] === '*') {
    Object.assign(state, consumeComment(source, { ...state, isBlock: true }, comments));
    return;
  }
  if (character === '"' || character === "'") {
    const end = consumeQuoted(source, state.index, character);
    state.line += countNewlines(source.slice(state.index, end));
    state.index = end;
    return;
  }
  state.index += 1;
}

export function findHtmlComments(source) {
  return [...source.matchAll(/<!--([\s\S]*?)-->/g)].map((match) => ({
    line: countNewlines(source.slice(0, match.index)) + 1,
    text: match[1],
  }));
}

function countNewlines(text) {
  let count = 0;
  for (const character of text) if (character === '\n') count += 1;
  return count;
}
