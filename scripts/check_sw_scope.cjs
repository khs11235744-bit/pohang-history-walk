const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
 const source=fs.readFileSync(require('node:path').join(__dirname,'../sw.js'),'utf8');
 const current=source.match(/const CACHE='([^']+)'/)[1],handlers={},deleted=[];
 const keys=[current,'pohang-history-walk-v16','other-project-v1'];
 let installCount=0;
 const sandbox={URL, self:{registration:{scope:"https://example.test/pohang-history-walk/"},addEventListener:(n,cb)=>handlers[n]=cb,clients:{claim:async()=>{}},skipWaiting:async()=>{}},caches:{keys:async()=>keys,delete:async k=>{deleted.push(k);return true},open:async()=>({addAll:async requests=>{assert.equal(new Set(requests).size,requests.length,'Offline installation must not submit duplicate cache keys');installCount=requests.length;}})}};
 vm.runInNewContext(source,sandbox);let completion;
 handlers.activate({waitUntil:p=>completion=p});await completion;
 assert.deepEqual(deleted,['pohang-history-walk-v16'],'Activation must leave unrelated project caches intact');
 handlers.install({waitUntil:p=>completion=p});await completion;
 assert.ok(installCount>70,'Core guide resources must be precached');
 console.log('PASS: old history-guide cache removed; other project cache preserved; unique install resources='+installCount);
})().catch(e=>{console.error(e);process.exit(1)});
