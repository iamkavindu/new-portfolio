import {getCliClient} from 'sanity/cli';
import {readFile} from 'node:fs/promises';
import sample from '../../trial/fixtures/streaming-article.json';

const client = getCliClient({apiVersion: '2025-02-19'});
const id = `drafts.${sample._id}`;
const existing = await client.fetch('*[_id in $ids][0]._id', {ids: [id, sample._id]}, {perspective: 'raw'});
if (existing) {
  console.log('The trial article already exists. Nothing was changed.');
} else {
  const body = await Promise.all(sample.body.map(async (block) => {
    if (block._type !== 'image' || !block._demoPath) return block;
    const imagePath = new URL(`../../public${block._demoPath}`, import.meta.url);
    const asset = await client.assets.upload('image', await readFile(imagePath), {filename: 'stream-app-architecture.png'});
    const {_demoPath, ...image} = block;
    return {...image, asset: {_type: 'reference', _ref: asset._id}};
  }));
  await client.createIfNotExists({...sample, _id: id, body});
  console.log('Created a DRAFT streaming trial article with its diagram. Open Writing in Studio. Nothing was published.');
}
