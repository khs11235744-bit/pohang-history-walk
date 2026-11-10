import {submissionApi} from './submission-config.js';

export const submissionConfigured = Boolean(submissionApi);

export async function api(path, {token, method = 'GET', body} = {}) {
  const headers = {};
  if (token) headers.Authorization = 'Bearer ' + token;
  if (body) headers['Content-Type'] = 'application/json';
  let response;
  try {
    response = await fetch(submissionApi + path, {
      method, headers, body:body ? JSON.stringify(body) : undefined,
      cache:'no-store', redirect:'error', signal:AbortSignal.timeout(25000)
    });
  } catch {
    throw new Error('서버에 연결하지 못했습니다. 입력을 보관하고 다시 시도해 주세요.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || '서버 응답을 확인하지 못했습니다.');
  return data;
}

export function koreaTime(iso) {
  return new Intl.DateTimeFormat('ko-KR', {timeZone:'Asia/Seoul', dateStyle:'short', timeStyle:'short'}).format(new Date(iso));
}
