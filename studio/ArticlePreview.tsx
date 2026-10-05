import {useState} from 'react';

type Article = {slug?: {current?: string}};

export function ArticlePreview({document}: {document: {displayed: Article}}) {
  const [revision, setRevision] = useState(0);
  const slug = document.displayed.slug?.current;
  const origin = (import.meta.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'http://localhost:4321').replace(/\/$/, '');
  if (!slug) return <p style={{padding: 24}}>Generate a URL in “Details” to preview this article.</p>;
  const path = `/trial/preview/${encodeURIComponent(slug)}/`;
  return <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <div style={{padding: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'}}>
      <button type="button" onClick={() => setRevision((value) => value + 1)}>Refresh preview</button>
      <a href={`${origin}${path}`} target="_blank" rel="noreferrer">Open draft preview</a>
      <a href={`${origin}/trial/article/${encodeURIComponent(slug)}/`} target="_blank" rel="noreferrer">Open published version</a>
    </div>
    <p style={{margin: '0 16px 12px', fontSize: 13}}>Save changes, then refresh. Unlock the preview with your local preview password when prompted.</p>
    <iframe key={`${slug}-${revision}`} src={`${origin}${path}`} title="Article draft preview" style={{border: 0, width: '100%', flex: 1, minHeight: 600}} />
  </div>;
}
