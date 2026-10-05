import {startMockServer} from './mock-server.mjs';
const review = await startMockServer(4322);
console.log(`Local sample-content review: ${review.base}`);
console.log('Uses fixture data only; performs no Sanity reads or writes. Stop with Ctrl+C.');
const stop = async () => {await review.close(); process.exit(0);};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
