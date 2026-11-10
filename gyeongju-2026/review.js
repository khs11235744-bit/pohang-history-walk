import {api, koreaTime, submissionConfigured} from './submission-api.js';

const $ = id => document.getElementById(id);
const states = {submitted:'접수', revision:'보완 요청', reviewed:'확인 완료'};
const labels = {student:'학생', topic:'주제', selectedPlace:'장소', mainSubject:'교과',
  question:'탐구 질문', observe:'현장 관찰', evidence1:'근거 1', evidence2:'근거 2',
  link:'교과 분석', contrast:'다른 입장', proposal:'결론', source:'참고 자료와 사진 설명'};
let token = '', detail = null, detailRequest = 0;
const status = value => $('reviewStatus').textContent = value;
const detailStatus = value => $('detailStatus').textContent = value;
const node = (tag, text) => Object.assign(document.createElement(tag), {textContent:text});

async function loadList(auth) {
  const data = await api('/teacher/submissions', {token:auth});
  if (auth !== token) return;
  $('summary').textContent = data.teacher + ' 선생님 · ' + data.submissions.length + ' / ' + data.total +
    '명 접수 · 확인 완료 ' + data.submissions.filter(row => row.status === 'reviewed').length + '명';
  $('submissions').replaceChildren(...data.submissions.map(row => {
    const item = node('li','');
    const button = node('button', row.student + ' · ' + row.topic);
    button.type = 'button';
    button.className = 'btn alt';
    button.addEventListener('click', () => openReport(row.id));
    item.append(button, ' ' + states[row.status] + ' · ' + koreaTime(row.submitted_at) + (row.reviewer ? ' · ' + row.reviewer : ''));
    return item;
  }));
  if (!data.submissions.length) $('submissions').append(node('li','접수된 보고서가 없습니다.'));
}

async function openReport(id) {
  const request = ++detailRequest;
  const auth = token;
  status('보고서를 불러오고 있습니다.');
  try {
    const data = await api('/teacher/submissions/' + id, {token:auth});
    if (request !== detailRequest || token !== auth) return;
    detail = data;
    $('reportData').replaceChildren(...Object.entries(labels).flatMap(([key,label]) =>
      [node('dt', label), node('dd', data.fields[key] || '—')]));
    $('reviewPhotos').replaceChildren(...data.photos.map((src, index) => {
      const image = document.createElement('img');
      image.alt = '현장 사진 ' + (index + 1);
      image.src = src;
      return image;
    }));
    $('decision').value = data.status === 'revision' ? 'revision' : 'reviewed';
    $('reviewNote').value = data.review_note ?? '';
    $('reportDetail').hidden = false;
    status('');
    detailStatus('');
    $('reportDetail').scrollIntoView({block:'start'});
  } catch (error) {
    if (request === detailRequest && token === auth) status(error.message);
  }
}

if (submissionConfigured) {
  api('/health').then(data => {
    if (data.ready) {
      $('availability').hidden = true;
      $('login').hidden = false;
    }
  }).catch(() => {});
}
$('login').addEventListener('submit', async event => {
  event.preventDefault();
  token = $('teacherCode').value.trim();
  const button = $('login').querySelector('button');
  button.disabled = true;
  try {
    await loadList(token);
    $('teacherCode').value = '';
    $('dashboard').hidden = false;
    $('login').hidden = true;
    status('');
  } catch (error) {
    token = '';
    status(error.message);
  } finally {
    button.disabled = false;
  }
});
$('logout').addEventListener('click', () => {
  token = '';
  detail = null;
  $('dashboard').hidden = true;
  $('reportDetail').hidden = true;
  $('submissions').replaceChildren();
  $('reportData').replaceChildren();
  $('reviewPhotos').replaceChildren();
  $('reviewForm').reset();
  $('summary').textContent = '';
  $('login').hidden = false;
  status('');
  $('teacherCode').focus();
});
$('refresh').addEventListener('click', () => loadList(token).catch(error => status(error.message)));
$('reviewForm').addEventListener('submit', async event => {
  event.preventDefault();
  if (!detail || !token) return;
  const auth = token;
  const id = detail.id;
  const button = $('reviewForm').querySelector('button');
  button.disabled = true;
  try {
    await api('/teacher/submissions/' + id, {token:auth, method:'PATCH',
      body:{status:$('decision').value, note:$('reviewNote').value, version:detail.version}});
    if (token !== auth || detail?.id !== id) return;
    detail.version++;
    detailStatus('검수 의견을 저장했습니다.');
    await loadList(auth);
  } catch (error) {
    if (token === auth && detail?.id === id) detailStatus(error.message);
  } finally {
    button.disabled = false;
  }
});
