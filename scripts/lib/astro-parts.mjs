const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

export function splitAstroFile(source) {
  const frontmatterMatch = FRONTMATTER.exec(source);
  const frontmatter = frontmatterMatch ? frontmatterMatch[1] : '';
  const rest = frontmatterMatch ? source.slice(frontmatterMatch[0].length) : source;
  return {
    frontmatter,
    body: rest,
    styles: collectBlocks(rest, 'style'),
    scripts: collectBlocks(rest, 'script'),
    template: stripBlocks(stripBlocks(rest, 'style'), 'script'),
  };
}

function collectBlocks(source, tagName) {
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, 'gi');
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

function stripBlocks(source, tagName) {
  const pattern = new RegExp(`<${tagName}[^>]*>[\\s\\S]*?</${tagName}>`, 'gi');
  return source.replace(pattern, '');
}

export function stripExpressions(template) {
  let output = '';
  let depth = 0;
  for (const character of template) {
    if (character === '{') depth += 1;
    else if (character === '}') depth = Math.max(0, depth - 1);
    else if (depth === 0) output += character;
  }
  return output;
}
