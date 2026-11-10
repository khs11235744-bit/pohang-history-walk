# 경주 현장 탐구 보고서 접수

포항고 2026년 경주 답사 전용 Worker다. 기존 포항 기행 Forms와 R&E 설문 응답에는 접근하지 않는다.
학생에게 배정한 30개 개별 코드로 보고서를 받고, 지도교사 3명은 각자 별도의 코드를 사용한다.
지도교사는 접수 목록과 사진을 열어 확인 완료 또는 보완 요청을 저장할 수 있다.
학생은 자기 코드로 상태와 의견을 확인하고 보완 요청 뒤 수정본을 다시 제출할 수 있다.

## 운영 연결

1. 승인된 학교용 Cloudflare 계정에서 `npx wrangler d1 create pohang-gyeongju-2026-submissions`를 실행한다.
2. `wrangler.example.toml`을 `wrangler.toml`로 복사하고 해당 D1 ID를 입력한다.
3. `npx wrangler d1 migrations apply DB --remote`와 `npx wrangler deploy`를 실행한다.
4. 저장소 밖의 비공개 경로를 정해 `node issue-codes.mjs <비공개 경로>`를 실행한다. `npx wrangler secret put ACCESS_HASHES < <비공개 경로>/hashes.json`로 해시만 등록한다. 코드 원문은 각 사용자를 확인한 뒤 개별 전달한다.
5. Worker의 `/health`와 가상 보고서 접수, 각 교사 권한을 확인한다. 가상 데이터를 제거하고 학교의 보존 기간과 접근권한을 확인한 뒤 `../submission-config.js`의 API 주소를 설정한다.
6. 별도 설문 사이트에 연결할 때는 경주 프로젝트에 해당하는 화면이나 인증 API를 확인한 뒤 링크나 연결을 추가한다. 기존 설문 응답·사진 저장 위치와 섞지 않는다.

사진은 브라우저에서 다시 인코딩한 JPEG 최대 3장(각 약 300KB)으로 전송한다. Worker가 요청과 파일 크기를 제한하며 D1에는 한 보고서를 한 행으로 저장한다.
교사 코드와 학생 코드는 서로 다른 권한을 가진다. 코드 원문과 실습용이 아닌 학생 자료는 공개 저장소에 넣지 않는다.
