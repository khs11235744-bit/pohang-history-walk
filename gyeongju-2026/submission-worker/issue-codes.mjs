import {createHash, randomBytes} from 'node:crypto';
import {mkdir, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';

const output = process.argv[2];
if (!output) throw new Error('비공개 출력 경로를 지정하세요. 예: '+join(tmpdir(), 'gyeongju-codes'));
await mkdir(output, {mode:0o700});
const token = () => randomBytes(24).toString('base64url');
const hash = value => createHash('sha256').update(value).digest('hex');
const students = Array.from({length:30}, token);
const teachers = Object.fromEntries(['강명지','박기학','권형석'].map(name => [name, token()]));
await writeFile(join(output,'codes.json'), JSON.stringify({students, teachers}, null, 2), {mode:0o600});
await writeFile(join(output,'hashes.json'), JSON.stringify({
  students:students.map(hash), teachers:Object.fromEntries(Object.entries(teachers).map(([key,value]) => [key,hash(value)]))
}), {mode:0o600});
