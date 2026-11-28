export function* markdownLines(body, { hideComments = false } = {}) {
    let fence;
    let inComment = false;
    for (const raw of body.replace(/\r\n/g, '\n').split('\n')) {
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
                const open = rest.indexOf('<!--');
                if (open < 0) {
                    line += rest;
                    break;
                }
                line += rest.slice(0, open);
                rest = rest.slice(open + 4);
                const credit = /^\s*fix-items:\s*(.*?)\s*-->\s*$/.exec(rest);
                if (credit) fixIds = credit[1].split(/\s*,\s*/);
                inComment = true;
            }
        }
        yield { line, fixIds, outsideFence: true };
    }
}
