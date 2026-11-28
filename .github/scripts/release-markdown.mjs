// Find a closing run of the same length, allowing line breaks within a paragraph.
function codeSpanEnd(lines, row, rest, length) {
    for (let i = row; i < lines.length; i++) {
        if (i !== row) {
            rest = lines[i];
            if (!rest.trim() || /^ {0,3}(?:#{1,6}(?:[ \t]|$)|>|(?:[-+*]|\d+[.)])[ \t]|`{3,}|~{3,})/.test(rest)) break;
        }
        for (const run of rest.matchAll(/`+/g)) {
            if (run[0].length === length) return { row: i, end: lines[i].length - rest.length + run.index + length };
        }
    }
    return null;
}

export function* markdownLines(body, { hideComments = false } = {}) {
    let fence;
    let inComment = false;
    let codeEnd;
    const lines = body.replace(/\r\n/g, '\n').split('\n');
    for (const [row, raw] of lines.entries()) {
        const marker = raw.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
        if (fence) {
            if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
            yield { line: raw, outsideFence: false };
            continue;
        }
        if (!inComment && marker && (marker[1][0] === '~' || !marker[2].includes('`'))) {
            fence = marker[1];
            yield { line: raw, outsideFence: false };
            continue;
        }
        let line = raw;
        let fixIds;
        if (hideComments) {
            line = '';
            let rest = raw;
            for (;;) {
                if (inComment) {
                    const close = /--!?>/.exec(rest);
                    if (!close) break;
                    rest = rest.slice(close.index + close[0].length);
                    inComment = false;
                }
                if (codeEnd) {
                    if (row < codeEnd.row) {
                        line += rest;
                        break;
                    }
                    const end = codeEnd.end - (raw.length - rest.length);
                    line += rest.slice(0, end);
                    rest = rest.slice(end);
                    codeEnd = null;
                }
                const token = /\\[\\`]|`+|<!--/.exec(rest);
                if (!token) {
                    line += rest;
                    break;
                }
                const value = token[0];
                line += rest.slice(0, token.index);
                rest = rest.slice(token.index + value.length);
                if (value !== '<!--') {
                    line += value;
                    if (value[0] === '`') codeEnd = codeSpanEnd(lines, row, rest, value.length);
                    continue;
                }
                const credit = /^\s*fix-items:\s*(.*?)\s*-->\s*$/.exec(rest);
                if (credit) fixIds = credit[1].split(/\s*,\s*/);
                inComment = true;
            }
        }
        yield { line, fixIds, outsideFence: true };
    }
}
