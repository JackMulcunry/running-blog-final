// Cleans raw post body HTML for display.
//
// Shared by src/pages/briefing/[slug].tsx (client) and scripts/generate-post-pages.cjs
// (build-time static HTML), so crawlers see the same formatting readers do: the body's
// own <h1> removed (the page renders the title), "---" paragraphs as <hr>, Markdown pipe
// tables as real <table>s, and "REFERENCE LIST:" labels as headings.

export function convertMarkdownTables(html) {
  return html.replace(/<p>(\|[\s\S]*?)<\/p>/g, (match, content) => {
    const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
    const isSep = (l) => /^\|[-:\s|]+\|$/.test(l);
    const sepIdx = lines.findIndex(isSep);
    if (sepIdx < 1 || lines.length < 3) return match;

    const headerLine = lines[sepIdx - 1];
    if (!headerLine.startsWith("|")) return match;
    const dataLines = lines.slice(sepIdx + 1).filter((l) => l.startsWith("|"));

    const parseRow = (row) =>
      row.split("|").slice(1, -1).map((c) => c.trim());

    const thStyle =
      "padding:8px 12px;text-align:left;border:1px solid #e5e7eb;font-size:0.8125rem;font-weight:600;color:#374151;background:#f3f4f6;";
    const tdStyle =
      "padding:8px 12px;border:1px solid #e5e7eb;font-size:0.8125rem;color:#374151;";

    const thead = `<thead><tr>${parseRow(headerLine)
      .map((h) => `<th style="${thStyle}">${h}</th>`)
      .join("")}</tr></thead>`;
    const tbody = `<tbody>${dataLines
      .map(
        (row, i) =>
          `<tr style="background:${i % 2 === 0 ? "#ffffff" : "#f9fafb"};">${parseRow(row)
            .map((c) => `<td style="${tdStyle}">${c}</td>`)
            .join("")}</tr>`,
      )
      .join("")}</tbody>`;

    return `<div style="overflow-x:auto;margin:1.5rem 0;"><table style="width:100%;border-collapse:collapse;">${thead}${tbody}</table></div>`;
  });
}

export function sanitizePostBody(html) {
  let result = html
    .replace(/<h1[^>]*>.*?<\/h1>/i, "")
    .replace(/\n---(?:<\/p>)?\n/g, "<hr>")
    .replace(/(<\/[uo]l>)\s*<p>\s*---\s*(?:<br\s*\/?>)?\s*<\/p>/g, "$1<hr>")
    .replace(/<p>\s*---\s*(?:<br\s*\/?>)?\s*<\/p>/g, "<hr>");

  result = convertMarkdownTables(result);

  // Wrap bare URLs as anchor tags; protect existing <a> elements first.
  const savedAnchors = [];
  result = result.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, (match) => {
    savedAnchors.push(match);
    return `\x02ANCHOR_${savedAnchors.length - 1}\x03`;
  });
  result = result.replace(/https?:\/\/[^\s<>"']+/g, (url) =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`,
  );
  result = result.replace(/\x02ANCHOR_(\d+)\x03/g, (_, i) => savedAnchors[parseInt(i, 10)]);

  // Normalize <p>-based reference labels ("REFERENCE LIST:", "<strong>References</strong>")
  // to <h3> so the reference formatter below can detect them. Only a paragraph that is
  // just the label matches; prose that merely mentions "references" is left alone.
  result = result.replace(
    /<p>\s*(?:<(?:strong|b)>)?\s*(?:reference list|references)\s*:?\s*(?:<\/(?:strong|b)>)?\s*<\/p>/gi,
    '<h3 style="font-size:0.75rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.12em;margin-top:2rem;margin-bottom:0.5rem;">References:</h3>',
  );

  // In sections whose heading contains "Reference", reformat any paragraph
  // that packs multiple numbered items into a styled <ol>.
  result = result.replace(
    /(<h[1-6][^>]*>[^<]*[Rr]eference[^<]*<\/h[1-6]>)([\s\S]*?)(?=<h[1-3]|$)/gi,
    (_match, heading, content) => {
      const reformatted = content.replace(/<p>([\s\S]*?)<\/p>/gi, (_p, inner) => {
        const trimmed = inner.trim();
        if (/(?:^|\n)\d+\./.test(trimmed)) {
          const items = trimmed.split(/\n(?=\d+\.)/).filter(Boolean);
          if (items.length > 1) {
            const liStyle =
              "font-size:0.875rem;color:#6b7280;margin-bottom:0.5rem;line-height:1.6;";
            return (
              `<ol style="font-size:0.875rem;color:#6b7280;padding-left:1.5rem;margin:0.75rem 0;">` +
              items
                .map(
                  (item) =>
                    `<li style="${liStyle}">${item.replace(/^\d+\.\s*/, "").trim()}</li>`,
                )
                .join("") +
              "</ol>"
            );
          }
        }
        return `<p style="font-size:0.875rem;color:#6b7280;">${inner}</p>`;
      });
      return heading + reformatted;
    },
  );

  return result;
}
