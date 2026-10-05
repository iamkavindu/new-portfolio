import {useState} from 'react';

type Document = {_id?: string; _type?: string; slug?: {current?: string}};
export function ContentPreview({document}: {document: {displayed: Document}}) {
  const [revision, setRevision] = useState(0);
  const value = document.displayed;
  const id = value._id?.replace(/^drafts\./, '');
  const type = value._type;
  const needsSlug = type === 'article' || type === 'project';
  const configured = import.meta.env.SANITY_STUDIO_PREVIEW_ORIGIN;
  const origin = (configured || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:4321' : window.location.origin)).replace(/\/$/, '');
  if (!id || !type || (needsSlug && !value.slug?.current)) return <p style={{padding: 24}}>Save the document and generate its URL in Details before opening Preview.</p>;
  const path = `/preview/${encodeURIComponent(type)}/${encodeURIComponent(id)}/`;
  const published = type === 'article' ? `/writing/${encodeURIComponent(value.slug!.current!)}/` : type === 'project' ? `/work/${encodeURIComponent(value.slug!.current!)}/` : type === 'profile' ? '/about/' : '/';
  return <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <div style={{padding: 16, display: 'flex', gap: 16, flexWrap: 'wrap'}}>
      <button type="button" onClick={() => setRevision((value) => value + 1)}>Refresh preview</button>
      <a href={`${origin}${path}`} target="_blank" rel="noreferrer">Open draft preview</a>
      <a href={`${origin}${published}`} target="_blank" rel="noreferrer">Open published version</a>
      {type === 'siteSettings' && <a href={`${origin}/preview/siteSettings/${encodeURIComponent(id)}/?view=contact`} target="_blank" rel="noreferrer">Preview Contact</a>}
    </div>
    <p style={{margin: '0 16px 12px', fontSize: 13}}>After changes save, refresh the draft preview. Publish in Studio to update the public version on its next request; no branch or build is needed.</p>
    <iframe key={`${id}-${revision}`} src={`${origin}${path}`} title="Private content preview" style={{border: 0, width: '100%', flex: 1, minHeight: 600}} />
  </div>;
}
