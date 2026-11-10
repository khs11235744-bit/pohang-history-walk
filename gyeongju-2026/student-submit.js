import {api, koreaTime, submissionConfigured} from './submission-api.js';

async function jpeg(file) {
  const image = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  try {
    const ratio = Math.min(1, 1280 / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * ratio));
    canvas.height = Math.max(1, Math.round(image.height * ratio));
    const context = canvas.getContext('2d', {alpha:false});
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [.78, .63, .46, .3]) {
      const data = canvas.toDataURL('image/jpeg', quality);
      if (data.length <= 400000) return data;
    }
    throw new Error('사진을 더 작은 파일로 선택해 주세요.');
  } finally {
    image.close();
  }
}

const statusText = {submitted:'접수 완료', revision:'보완 요청', reviewed:'확인 완료'};

export async function attachStudentSubmit(readFields) {
  if (!submissionConfigured) return;
  const $ = id => document.getElementById(id);
  const form = $('submissionForm');
  const hint = $('submissionAvailability');
  try {
    if (!(await api('/health')).ready) return;
  } catch { return; }

  hint.hidden = true;
  form.hidden = false;
  const busy = value => form.querySelectorAll('button').forEach(button => button.disabled = value);
  const status = value => $('submissionStatus').textContent = value;
  const token = () => $('studentInvite').value.trim();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const fields = readFields();
    const required = {student:'학생 정보', topic:'탐구 주제', selectedPlace:'장소', mainSubject:'중점 교과',
      question:'탐구 질문', observe:'현장 관찰', evidence1:'근거 1', evidence2:'근거 2', link:'교과 분석', proposal:'결론'};
    const missing = Object.keys(required).find(key => !fields[key].trim());
    if (missing) {
      status(required[missing] + '을(를) 작성해 주세요.');
      $(missing).focus();
      return;
    }
    if (!confirm('이 보고서와 첨부 사진을 지도교사에게 제출하시겠습니까?')) return;
    busy(true);
    status('보고서와 사진을 전송하고 있습니다.');
    try {
      const files = [...document.querySelectorAll('[data-photo]')].flatMap(input => [...input.files]);
      const photos = await Promise.all(files.map(jpeg));
      const data = await api('/submit', {token:token(), method:'POST', body:{fields, photos}});
      status('접수 완료 · ' + koreaTime(data.submitted_at) + ' · 접수번호 ' + data.id);
    } catch (error) {
      status(error.message);
    } finally {
      busy(false);
    }
  });
  $('checkReceipt').addEventListener('click', async () => {
    if (!$('studentInvite').reportValidity()) return;
    busy(true);
    try {
      const {receipt} = await api('/receipt', {token:token()});
      status(receipt ? statusText[receipt.status] + ' · ' + koreaTime(receipt.submitted_at) +
        (receipt.review_note ? ' · 지도교사 의견 ' + receipt.review_note : '') : '이 코드의 접수 기록이 없습니다.');
    } catch (error) {
      status(error.message);
    } finally {
      busy(false);
    }
  });
}
