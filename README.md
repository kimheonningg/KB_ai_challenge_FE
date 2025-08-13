# KB AI Challenge Frontend - 포트폴리오 관리 및 AI 어시스턴트 플랫폼

## 프로젝트 개요

KB AI Challenge Frontend는 개인 투자자들을 위한 포트폴리오 관리 및 AI 기반 투자 어시스턴트 플랫폼입니다. 주식 시뮬레이션, 리스크 분석, 포트폴리오 리밸런싱 등 다양한 투자 도구를 제공하며, AI 챗봇을 통한 투자 상담 서비스를 지원합니다.

## 주요 기능

### **홈페이지 (Home)**
- 사용자 인증 상태에 따른 맞춤형 대시보드
- 포트폴리오 요약 정보 표시
- 빠른 액세스 메뉴 제공

### **사용자 인증 시스템**
- **로그인 (Login)**: 기존 사용자 로그인
- **회원가입 (Register)**: 신규 사용자 등록
- **사용자 프로필 (UserProfile)**: 개인 정보 관리 및 설정

### **포트폴리오 관리**
- **포트폴리오 추가 (AddPortfolio)**: 새로운 포트폴리오 생성 및 관리
- **포트폴리오 대시보드**: 포트폴리오 성과 및 자산 배분 시각화
- **포트폴리오 목록**: 보유 포트폴리오 전체 조회

### **AI 어시스턴트 (AIAssistantDashboard)**
- **채팅 섹션 (ChatSection)**: AI와의 실시간 투자 상담
- **인사이트 섹션 (InsightsSection)**: AI 기반 투자 인사이트 제공
- **포트폴리오 요약 섹션 (PortfolioSummarySection)**: 포트폴리오 현황 요약

### **투자 도구**
- **주식 시뮬레이션 (StockSimulation)**: 가상 투자 환경에서 주식 거래 연습
- **리스크 및 리밸런싱 (RiskAndRebalance)**: 포트폴리오 리스크 분석 및 자산 재배분
- **리포트 생성 (Reports)**: 투자 성과 및 분석 리포트 생성

### **컴포넌트 시스템**
- **FeatureTabs**: 기능별 탭 네비게이션
- **Header**: 상단 네비게이션 바
- **StockChart**: 주식 차트 시각화
- **StockInfo**: 주식 정보 표시
- **PortfolioDashboard**: 포트폴리오 대시보드
- **PortfolioList**: 포트폴리오 목록 관리

## 기술 스택

### **Frontend Framework**
- **React 19.1.0**: 최신 React 버전을 사용한 컴포넌트 기반 UI 개발
- **React Router DOM 7.7.1**: SPA 라우팅 및 네비게이션

### **Build Tools**
- **Webpack 5.100.2**: 모듈 번들링 및 개발 서버
- **Babel**: ES6+ 코드 변환 및 JSX 지원
- **CSS Loader & Style Loader**: CSS 모듈 처리

### **HTTP 통신**
- **Axios 1.11.0**: HTTP 클라이언트 라이브러리
- **Dotenv 17.2.1**: 환경 변수 관리

### **UI/UX**
- **React Markdown 10.1.0**: 마크다운 렌더링 지원
- **커스텀 CSS**: 반응형 디자인 및 모던 UI

## 프로젝트 구조

```
KB_ai_challenge_FE/
├── public/
│   └── index.html                 # 메인 HTML 템플릿
├── src/
│   ├── components/                 # 재사용 가능한 컴포넌트
│   │   ├── AIAssistant/           # AI 어시스턴트 관련 컴포넌트
│   │   │   ├── ChatSection.jsx    # AI 채팅 인터페이스
│   │   │   ├── InsightsSection.jsx # AI 인사이트 표시
│   │   │   └── PortfolioSummarySection.jsx # 포트폴리오 요약
│   │   ├── AIAssistantDashboard.jsx # AI 어시스턴트 메인 대시보드
│   │   ├── FeatureTabs.jsx        # 기능별 탭 네비게이션
│   │   ├── Header.jsx             # 상단 헤더 컴포넌트
│   │   ├── LoginRequired.jsx      # 로그인 필요 알림
│   │   ├── PortfolioDashboard.jsx # 포트폴리오 대시보드
│   │   ├── PortfolioList.jsx      # 포트폴리오 목록
│   │   ├── StockChart.jsx         # 주식 차트 컴포넌트
│   │   └── StockInfo.jsx          # 주식 정보 표시
│   ├── pages/                      # 페이지 컴포넌트
│   │   ├── About.jsx              # 소개 페이지
│   │   ├── AddPortfolio.jsx       # 포트폴리오 추가
│   │   ├── Home.jsx               # 홈페이지
│   │   ├── Login.jsx              # 로그인 페이지
│   │   ├── Register.jsx           # 회원가입 페이지
│   │   ├── Reports.jsx            # 리포트 생성
│   │   ├── RiskAndRebalance.jsx   # 리스크 및 리밸런싱
│   │   ├── StockSimulation.jsx    # 주식 시뮬레이션
│   │   └── UserProfile.jsx        # 사용자 프로필
│   ├── styles/                     # 스타일시트
│   │   ├── aiAssistantPageComponents.css # AI 어시스턴트 컴포넌트 스타일
│   │   └── aiAssistantPages.css   # AI 어시스턴트 페이지 스타일
│   ├── utils/                      # 유틸리티 함수
│   │   ├── alphavantage.js        # Alpha Vantage API 연동
│   │   ├── auth.js                # 인증 관련 유틸리티
│   │   ├── axiosInstance.js       # Axios 인스턴스 설정
│   │   ├── chatbot.js             # 챗봇 관련 유틸리티
│   │   ├── favstocks.js           # 관심주 관리
│   │   ├── feedback.js            # 피드백 처리
│   │   ├── portfolio.js           # 포트폴리오 관리
│   │   ├── report.js              # 리포트 생성
│   │   ├── riskAndRebalance.js    # 리스크 및 리밸런싱 계산
│   │   └── stockSimulation.js     # 주식 시뮬레이션 로직
│   ├── App.css                    # 메인 앱 스타일
│   ├── App.jsx                    # 메인 앱 컴포넌트 및 라우팅
│   ├── const.js                   # 상수 정의
│   └── index.jsx                  # 앱 진입점
├── package.json                   # 프로젝트 의존성 및 스크립트
├── package-lock.json              # 의존성 잠금 파일
├── webpack.config.js              # Webpack 설정
└── README.md                      # 프로젝트 문서
```

## 설치 및 실행 방법

### **사전 요구사항**
- **Node.js**: 18.0.0 이상 버전 필요
- **npm**: Node.js와 함께 설치됨

### **1단계: 프로젝트 클론**
```bash
git clone [repository-url]
cd KB_ai_challenge_FE
```

### **2단계: 의존성 설치**
```bash
npm install
```

### **3단계: 개발 서버 실행**
```bash
npm start
```

### **4단계: 브라우저에서 확인**
- 자동으로 브라우저가 열리며 `http://localhost:3000`에서 앱을 확인할 수 있습니다
- 수동으로 접속하려면 브라우저에서 `http://localhost:3000` 입력

## 사용 가능한 스크립트

### **개발 모드**
```bash
npm start          # 개발 서버 실행 (Webpack Dev Server)
```

### **프로덕션 빌드**
```bash
npm run build     # 프로덕션용 번들 생성
```

## 환경 설정

### **환경 변수 설정**
프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# API 키 설정
ALPHAVANTAGE_API_KEY=your_api_key_here

```

## 주요 API 연동

### **Alpha Vantage API**
- 주식 시세 데이터 제공
- 실시간 시장 정보
- 히스토리컬 데이터

### **백엔드 API**
- 사용자 인증
- 포트폴리오 관리
- AI 챗봇 서비스

## UI/UX 특징

### **반응형 디자인**
- 모바일, 태블릿, 데스크톱 모든 디바이스 지원
- 터치 친화적 인터페이스

### **모던 디자인**
- 깔끔하고 직관적인 사용자 인터페이스
- Material Design 원칙 적용
- 부드러운 애니메이션 및 전환 효과

### **접근성**
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 고대비 모드 지원

## 보안 기능

### **인증 시스템**
- JWT 토큰 기반 인증
- 로컬 스토리지를 활용한 세션 관리
- 보안된 API 통신

### **데이터 보호**
- 민감한 정보 암호화
- HTTPS 통신 강제
- XSS 및 CSRF 방어

## 브라우저 지원

### **지원 브라우저**
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### **지원하지 않는 브라우저**
- Internet Explorer (모든 버전)
- 구형 모바일 브라우저

## 문제 해결

### **일반적인 문제들**

#### **포트 충돌**
```bash
# 다른 포트 사용
PORT=3001 npm start
```

#### **의존성 문제**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

#### **빌드 오류**
```bash
# 캐시 클리어
npm run build -- --reset-cache
```

### **개발자 도구**
- 브라우저 개발자 도구 활용
- React Developer Tools 확장 프로그램 설치 권장
- Webpack DevTools 활용

## 추가 리소스

### **문서**
- [React 공식 문서](https://react.dev/)
- [React Router 문서](https://reactrouter.com/)
- [Webpack 문서](https://webpack.js.org/)

### **커뮤니티**
- [React 커뮤니티](https://reactjs.org/community/support.html)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react)

## 기여 방법

### **개발 환경 설정**
1. 프로젝트 포크
2. 기능 브랜치 생성
3. 코드 작성 및 테스트
4. Pull Request 생성

### **코딩 컨벤션**
- ESLint 규칙 준수
- Prettier 포맷팅 적용
- 의미있는 커밋 메시지 작성

## 라이선스

이 프로젝트는 ISC 라이선스 하에 배포됩니다.

## 팀원

- **개발자**: [개발자 이름]
- **디자이너**: [디자이너 이름]
- **프로젝트 매니저**: [PM 이름]

## 연락처

- **이메일**: [contact@example.com]
- **GitHub**: [https://github.com/username]
- **프로젝트 이슈**: [GitHub Issues 페이지]

## 업데이트 로그

### **v1.0.0 (2024-01-XX)**
- 초기 버전 릴리즈
- 기본 포트폴리오 관리 기능
- AI 어시스턴트 베타 버전
- 사용자 인증 시스템

---

**© 2024 KB AI Challenge Frontend Team. All rights reserved.**
