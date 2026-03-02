const URL_RE = /(https?:\/\/[^\s<>"]+)/gi;

/**
 * Converts plain text with URLs to a DocumentFragment containing
 * text nodes and <a> elements. Never uses innerHTML.
 */
export function linkify(text) {
  const fragment = document.createDocumentFragment();
  const parts = text.split(URL_RE);

  parts.forEach((part) => {
    if (URL_RE.test(part)) {
      const a = document.createElement('a');
      a.href = part;
      a.textContent = part;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      fragment.appendChild(a);
    } else if (part) {
      // Handle newlines
      const lines = part.split('\n');
      lines.forEach((line, i) => {
        if (i > 0) fragment.appendChild(document.createElement('br'));
        if (line) fragment.appendChild(document.createTextNode(line));
      });
    }
    URL_RE.lastIndex = 0;
  });

  return fragment;
}
