const teacherNames = ['강명지', '박기학', '권형석'];
const reportFields = ['student', 'topic', 'selectedPlace', 'mainSubject', 'question', 'observe',
  'evidence1', 'evidence2', 'link', 'contrast', 'proposal', 'source'];
const requiredFields = ['student', 'topic', 'selectedPlace', 'mainSubject', 'question', 'observe', 'evidence1', 'evidence2', 'link', 'proposal'];
const maxBody = 1300000;
const textEncoder = new TextEncoder();

async function sha256(value) {
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(value));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

class RequestError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function readJson(request, limit = maxBody) {
  if (!request.body || Number(request.headers.get('content-length')) > limit) {
    throw new RequestError(413, '전송할 자료가 너무 큽니다.');
  }
  const decoder = new TextDecoder();
  const reader = request.body.getReader();
  let text = '', size = 0;
  for (;;) {
    const {value, done} = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new RequestError(413, '전송할 자료가 너무 큽니다.');
    }
    text += decoder.decode(value, {stream:true});
  }
  try {
    const data = JSON.parse(text + decoder.decode());
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
    return data;
  } catch {
    throw new RequestError(400, '보고서 전송 형식을 확인해 주세요.');
  }
}

function getAccess(env) {
  try {
    const access = JSON.parse(env.ACCESS_HASHES);
    const hash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
    if (!env.DB || !Array.isArray(access.students) || access.students.length !== 30
        || new Set(access.students).size !== 30 || !access.students.every(hash)
        || !teacherNames.every(name => hash(access.teachers?.[name]))
        || new Set(teacherNames.map(name => access.teachers[name])).size !== 3
        || teacherNames.some(name => access.students.includes(access.teachers[name]))) throw new Error();
    return access;
  } catch {
    throw new RequestError(503, '제출 접수 준비 중입니다.');
  }
}

function validateReport(data) {
  const fields = Object.fromEntries(reportFields.map(key => [key,
    typeof data.fields?.[key] === 'string' ? data.fields[key].trim() : '']));
  if (requiredFields.some(key => !fields[key]) || fields.student.length > 80
      || fields.topic.length > 180 || Object.values(fields).some(value => value.length > 6000)) {
    throw new RequestError(422, '학생 정보, 탐구 질문, 근거 2개, 교과 분석과 결론을 확인해 주세요.');
  }
  if (!Array.isArray(data.photos) || data.photos.length > 3 || data.photos.some(photo =>
    typeof photo !== 'string' || photo.length > 400000 || !/^data:image\/jpeg;base64,\/9j\/[a-zA-Z0-9+/=]+$/.test(photo))) {
    throw new RequestError(422, '첨부 사진을 확인해 주세요.');
  }
  return JSON.stringify({fields, photos:data.photos});
}

async function submit(request, db, invite) {
  const payload = validateReport(await readJson(request));
  const digest = await sha256(payload);
  const {student, topic} = JSON.parse(payload).fields;
  await db.prepare(`INSERT INTO submissions
    (id, invite_hash, student, topic, payload, payload_hash, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(invite_hash) DO UPDATE SET student = excluded.student, topic = excluded.topic,
      payload = excluded.payload, payload_hash = excluded.payload_hash, submitted_at = excluded.submitted_at,
      status = 'submitted', version = submissions.version + 1
    WHERE submissions.status = 'revision' AND submissions.payload_hash <> excluded.payload_hash`)
    .bind(crypto.randomUUID(), invite, student, topic, payload, digest, new Date().toISOString()).run();
  const row = await db.prepare('SELECT id, submitted_at, payload_hash FROM submissions WHERE invite_hash = ?').bind(invite).first();
  if (row.payload_hash !== digest) throw new RequestError(409, '이미 제출했습니다. 변경은 지도교사의 보완 요청 후에 할 수 있습니다.');
  return {id:row.id, submitted_at:row.submitted_at};
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin');
    const allowed = env.ALLOWED_ORIGIN ?? 'https://khs11235744-bit.github.io';
    const headers = new Headers({'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Vary':'Origin'});
    if (origin === allowed) headers.set('Access-Control-Allow-Origin', origin);
    const json = (body, status = 200) => Response.json(body, {status, headers});
    if (origin && origin !== allowed) return json({error:'허용되지 않은 주소입니다.'}, 403);
    if (request.method === 'OPTIONS') {
      headers.set('Access-Control-Allow-Methods','GET, POST, PATCH, OPTIONS');
      headers.set('Access-Control-Allow-Headers','Authorization, Content-Type');
      return new Response(null, {status:204, headers});
    }
    const path = new URL(request.url).pathname;
    try {
      const access = getAccess(env);
      if (path === '/health' && request.method === 'GET') {
        await env.DB.prepare('SELECT 1 FROM submissions LIMIT 1').first();
        return json({ready:true});
      }
      const token = request.headers.get('Authorization')?.match(/^Bearer ([a-zA-Z0-9_-]{24,90})$/)?.[1];
      if (!token) return json({error:'접수 코드 또는 지도교사 코드를 확인해 주세요.'}, 401);
      const hash = await sha256(token);
      const db = env.DB;
      if (path === '/submit' || path === '/receipt') {
        if (!access.students.includes(hash)) return json({error:'학생 접수 코드를 확인해 주세요.'}, 401);
        if (path === '/submit' && request.method === 'POST') return json(await submit(request, db, hash));
        if (path === '/receipt' && request.method === 'GET') {
          const row = await db.prepare('SELECT id, submitted_at, status, review_note FROM submissions WHERE invite_hash = ?').bind(hash).first();
          return json({receipt:row ?? null});
        }
      }
      const teacher = teacherNames.find(name => access.teachers[name] === hash);
      if (!teacher) return json({error:'지도교사 코드를 확인해 주세요.'}, 401);
      if (path === '/teacher/submissions' && request.method === 'GET') {
        const {results} = await db.prepare('SELECT id, student, topic, submitted_at, status, reviewer, reviewed_at FROM submissions ORDER BY submitted_at DESC').all();
        return json({teacher, total:access.students.length, submissions:results});
      }
      const id = path.match(/^\/teacher\/submissions\/([a-f0-9-]{36})$/)?.[1];
      if (id && request.method === 'GET') {
        const row = await db.prepare('SELECT id, payload, status, reviewer, review_note, version FROM submissions WHERE id = ?').bind(id).first();
        if (!row) return json({error:'보고서를 찾을 수 없습니다.'}, 404);
        const {payload, ...review} = row;
        return json({...review, ...JSON.parse(payload)});
      }
      if (id && request.method === 'PATCH') {
        const data = await readJson(request, 7000);
        const note = typeof data.note === 'string' ? data.note.trim() : '';
        if (!['reviewed','revision'].includes(data.status) || !Number.isInteger(data.version) ||
            note.length > 1000 || (data.status === 'revision' && !note)) {
          throw new RequestError(422, '검수 상태와 보완 의견을 확인해 주세요.');
        }
        const result = await db.prepare(`UPDATE submissions SET status = ?, reviewer = ?, review_note = ?,
          reviewed_at = ?, version = version + 1 WHERE id = ? AND version = ?`)
          .bind(data.status, teacher, note, new Date().toISOString(), id, data.version).run();
        if (result.meta.changes !== 1) throw new RequestError(409, '보고서가 갱신되었습니다. 다시 열어 확인해 주세요.');
        return json({saved:true});
      }
      return json({error:'이 주소를 찾을 수 없습니다.'}, 404);
    } catch (error) {
      if (error instanceof RequestError) return json({error:error.message}, error.status);
      return json({error:'서버에 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요.'}, 503);
    }
  }
};
