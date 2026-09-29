const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
 const source=fs.readFileSync(require('node:path').join(__dirname,'../sw.js'),'utf8');
 const current=source.match(/const CACHE='([^']+)'/)[1],handlers={},deleted=[];
 const keys=[current,'pohang-history-walk-v16','other-project-v1'];
 const sandbox={self:{addEventListener:(n,cb)=>handlers[n]=cb,clients:{claim:async()=>{}}},caches:{keys:async()=>keys,delete:async k=>{deleted.push(k);return true}}};
 vm.runInNewContext(source,sandbox);let completion;
 handlers.activate({waitUntil:p=>completion=p});await completion;
 assert.deepEqual(deleted,['pohang-history-walk-v16'],'Activation must leave unrelated project caches intact');
 console.log('PASS: old history-guide cache removed; other project cache preserved');
})().catch(e=>{console.error(e);process.exit(1)});
