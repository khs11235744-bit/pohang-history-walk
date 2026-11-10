# 경주 교과 연계 탐구 REA 비교·적용 기록
작성: 2026-11-10

## 목표
원래 포항 인문학 기행 저장소의 요록·활동지·교사용 진행 자료 기능을 경주 답사에 다시 제공한다. 기존 포항 기행 콘텐츠는 바꾸지 않고 `gyeongju-2026/` 경로만 개선한다.

## 비교 대상과 공개 근거
1. Google Arts & Culture Expeditions (https://artsandculture.google.com/project/expeditions): 과목별 가상 탐방, 장소별 안내와 학습자료. 적용: 장소별 요록과 설명, 관련 교과별 질문, 현장 흐름을 분리한 정보 구조.
2. Google Arts & Culture Learn (https://artsandculture.google.com/project/learn): 학습 활동과 자료 탐색을 하나의 메뉴 흐름으로 제공. 적용: 안내 → 요록 → 기록 활동지 → 보고서.
3. Teaching with Europeana (https://teachwitheuropeana.eun.org/learning-scenarios/): 학습 시나리오, 교사가 적용한 사례와 탐구 과정을 분리. 적용: 교사용 지도안·평가 기준을 학생 안내와 분리.
4. Smithsonian Learning Lab (https://www.si.edu/educators/art-resources): 실물 자료를 기반으로 한 관찰 질문과 후속 활동. 적용: 관찰 사실 / 공식 설명 / 개인 해석 분리, 기록 과제 및 자기 점검.

분석 대상은 각 사이트의 공개된 사용자 흐름과 교육 기능, 정보 배열 방식이다. 디자인 자산, 콘텐츠, 소스 코드를 복사하지 않았으며 새로운 한국어 교육용 콘텐츠와 CSS를 독립 작성하였다. 로컬 PC의 rea-agents 6.4.0 CLI 실행은 수행하지 않았다(연결 상태 확인 및 실행 근거 없음). 여기서 REA는 공개 화면과 상호작용을 관찰해 필요한 기능으로 재설계하는 비교 방식이다.

## 사실 확인 출처
- UNESCO Gyeongju Historic Areas: https://whc.unesco.org/en/list/976
- 국가유산포털 경주역사유적지구: https://www.heritage.go.kr/heri/html/HtmlPage.do?pageNo=4_2_2_1&pg=%2Funesco%2FHeritage%2FHeritage_06.jsp
- 국립경주박물관 신라역사관: https://gyeongju.museum.go.kr/kor/html/sub02/0201.html?d_mng_no=10&mode=VD
- 경주시 교촌마을 안내: https://www.gyeongju.go.kr/tour_bak/page.do?mnu_uid=3164
- 경주시 월정교지: https://www.gyeongju.go.kr/tour/page.do?chaNo=3325&cmd=2&mnu_uid=4798
- 경주시 첨성대: https://www.gyeongju.go.kr/tour/page.do?area_uid=47&cmd=2&mnu_uid=4716
- 경주시 대릉원: https://www.gyeongju.go.kr/tour/page.do?area_uid=203&cmd=2&mnu_uid=4716
- 경주시 황리단길: https://www.gyeongju.go.kr/tour/page.do?area_uid=53&cmd=2&mnu_uid=4716
- 경주시 쪽샘: https://gyeongju.go.kr/tour/page.do?mnu_uid=4734

## 기능 구성
- `index.html`: 첫 화면, 6개 주요 답사장소, 일정, 자료실, 간편 보고서 입력 기능. 보고서 임시 저장 시 확장 입력 항목을 보존한다.
- `guide.html`: 6개 장소 + 선택 1곳(쪽샘), 장소별 시대 설명, 역사/사회/윤리 학습목표, 현장 과제, 논제, 2분 교사 해설, 출처.
- `learning.html`: 기록형 활동지 7곳, 퀴즈 3개, 기기 임시 저장, 텍스트 파일 내려받기, 보고서 기록 전송.
- `report.html`: 통합 보고서, 근거 2개, 반론, 결론, 사진 3장 첨부 및 현재 화면 미리보기, 사진 포함 HTML/텍스트 내려받기, PDF 인쇄, 임시 저장.
- `teacher.html`: 교과별 학습목표·증거·평가 질문, 일정별 진행안, 교사용 설명, 20점 기준표 예시, 안전·개인정보 안내.
- `studio.css`, `portal.css`: 모바일·인쇄 대응의 독립 디자인. 이미지 라이선스 문제를 피하기 위해 자체 SVG 개념도를 사용한다.

## 안전·제약
- 학생 기록/사진 서버 업로드, 교사용 제출 수합, 로그인은 구현되지 않았다. 이 기능들이 있는 것처럼 표시하지 않는다.
- 활동지와 보고서는 각 브라우저의 localStorage에 텍스트만 저장한다. 사진은 현재 화면에만 메모리로 유지하며 별도 HTML로 내보내야 보존된다.
- 민감한 개인정보·학생별 점수는 공개 `teacher.html`에 저장하지 않는다.
- 원래 포항 기행의 `guide.html` 등은 건드리지 않고 경주 전용 경로로 새 페이지를 추가했다.
- 쪽샘유적발굴관은 확정 동선에 포함된 것으로 취급하지 않으며 선택/대체 학습으로 분리한다.
- 날짜 2026.12.16~17, 지도교사 강명지·박기학·권형석, 학생 30명, 1-8·1-9반은 기존 합의에서 유지한다.

## 검수 항목
- [ ] 다섯 페이지가 모두 공개 도메인에서 200 응답으로 열리는지
- [ ] index.html 자료실·6개 장소 카드가 해당 요록의 각 위치로 열리는지
- [ ] 학습지 저장/복원/활동지→보고서 전송 동작 검증
- [ ] 보고서의 기존 간편 작성 내용 유지 및 확장 항목 보존 검증
- [ ] 사진 미리보기/인쇄/HTML 포함 출력
- [ ] 모바일 360px, 768px, 1200px 화면 점검
- [ ] 실제 학생 개별 정보 수합 전 인증·개인정보 보호 계획 별도 수립

