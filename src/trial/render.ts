import {toHTML} from '@portabletext/to-html';
import {createImageUrlBuilder} from '@sanity/image-url';
import {codeToHtml} from 'shiki';
import {projectId, dataset, type TrialBlock} from './client';

export const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]!));
export function safeHref(value: unknown): string {
  const href = String(value ?? '').trim();
  if (/^(https?:\/\/|mailto:)/i.test(href)) return href;
  if (/^\/(?!\/)/.test(href) && !/[\\\u0000-\u0020]/.test(href)) return href;
  if (/^#[a-zA-Z0-9_-]+$/.test(href)) return href;
  return '#';
}
export const headingId = (key: unknown) => `section-${String(key ?? '').replace(/[^a-zA-Z0-9_-]/g, '')}`;

export async function renderBody(body: TrialBlock[]): Promise<string> {
  const highlighted = new Map<string, string>();
  for (const block of body.filter((block) => block._type === 'code')) {
    let html: string;
    try { html = await codeToHtml(String(block.code || ''), {lang: block.language || 'text', theme: 'github-light'}); }
    catch { html = `<pre><code>${escapeHtml(block.code)}</code></pre>`; }
    highlighted.set(block._key, html);
  }
  const imageBuilder = createImageUrlBuilder({projectId, dataset});
  return toHTML(body, {
    components: {
      block: {
        h2: ({value, children}) => `<h2 id="${headingId(value._key)}">${children}</h2>`,
        h3: ({value, children}) => `<h3 id="${headingId(value._key)}">${children}</h3>`,
      },
      marks: {link: ({value, children}) => `<a href="${escapeHtml(safeHref(value?.href))}">${children}</a>`},
      types: {
        code: ({value}) => `<figure class="code-block"><figcaption>${escapeHtml(value.filename || value.language || 'Code')}</figcaption>${highlighted.get(value._key) || ''}</figure>`,
        image: ({value}) => {
          let src = '';
          let srcset = '';
          if (value.asset?._ref) {
            try {
              src = imageBuilder.image(value).width(1400).fit('max').auto('format').url();
              srcset = [480, 800, 1100, 1400].map((width) => `${imageBuilder.image(value).width(width).fit('max').auto('format').url()} ${width}w`).join(', ');
            } catch { return '<p>Image unavailable. Re-upload this image in Studio.</p>'; }
          } else if (/^\/images\/blogs\/[a-zA-Z0-9/_.-]+$/.test(value._demoPath || '')) src = value._demoPath;
          if (!src) return '<p>Upload an image in Studio to see it here.</p>';
          return `<figure><a href="${escapeHtml(src)}" target="_blank" rel="noopener noreferrer"><img src="${escapeHtml(src)}" ${srcset ? `srcset="${escapeHtml(srcset)}" sizes="(max-width: 760px) 90vw, 680px"` : ''} alt="${escapeHtml(value.alt)}" loading="lazy" /></a>${value.caption ? `<figcaption>${escapeHtml(value.caption)}</figcaption>` : ''}</figure>`;
        },
        trialCallout: ({value}) => `<aside class="callout">${value.title ? `<strong>${escapeHtml(value.title)}</strong>` : ''}<p>${escapeHtml(value.text)}</p></aside>`,
        trialTable: ({value}) => {
          const headers: string[] = value.headers || [];
          const rows: {cells?: string[]}[] = value.rows || [];
          return `<div class="table-scroll"><table>${value.caption ? `<caption>${escapeHtml(value.caption)}</caption>` : ''}<thead><tr>${headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((_, index) => `<td>${escapeHtml(row.cells?.[index])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
        },
      },
      unknownType: ({value}) => `<p>Unsupported content block: ${escapeHtml(value._type)}.</p>`,
    },
  });
}
