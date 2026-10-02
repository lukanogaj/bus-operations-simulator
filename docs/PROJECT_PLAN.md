🚌 BUS OPERATIONS SIMULATOR

🚀 FINAL MASTER PLAN — UPDATE 01.10.2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 GŁÓWNY CEL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Zbudować kompletny Bus Operations Simulator jako HERO PROJECT
pod wejście na polski rynek Software / Full-Stack Development.

Target:

🇵🇱 Polska
📍 Kraków / Rzeszów / Remote PL
💼 Junior / Junior+ Software / Full-Stack Developer

⚛️ React + TypeScript
🟢 Node.js + Express
🐘 PostgreSQL

Projekt ma pokazywać:

✅ realny problem biznesowy
✅ doświadczenie domenowe transportu
✅ frontend
✅ backend
✅ PostgreSQL
✅ REST API
✅ authentication
✅ business logic
✅ testing
✅ Docker
✅ deployment
✅ AI integration

NIE budujemy enterprise-monolitu.

Budujemy:

🔥 mały, kompletny, profesjonalny system operacyjny,
który potrafię później samodzielnie wyjaśnić.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔒 FINAL SCOPE LOCK — 01.10.2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

W FINAL SCOPE są:

✅ Dashboard operacyjny
✅ Drivers
✅ Duties
✅ Allocation
✅ Operations Board
✅ Incidents
✅ Sign-On Sheet
✅ Reports
✅ Admin + Role Permissions
✅ Testing
✅ AI Operations Assistant
✅ Docker / Production / Deployment
✅ README / Architecture / Live Demo

Poza FINAL SCOPE:

❌ Vehicles / fleet management
❌ engineering / mechanical workflow
❌ rozbudowany BI
❌ enterprise ticketing
❌ niepotrzebny overengineering

╔══════════════════════════════════════════════════════════════╗
║ 🟢 FAZA 1 — BUILD FAST ║
╚══════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ ETAP 1 — CORE APPLICATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ React + TypeScript
✅ Vite
✅ layout / sidebar
✅ Drivers
✅ Duties

❌ Vehicles — USUWAMY Z FINAL SCOPE

✅ Allocation
✅ weekly rota
✅ PDF generation

🟡 Dashboard — baza istnieje,
finalny dashboard operacyjny do domknięcia

STATUS:

🟢 CORE DZIAŁA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ ETAP 2 — POSTGRESQL + BACKEND

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ PostgreSQL
✅ Express backend
✅ REST API

DATABASE:

✅ drivers
160 records

✅ duties
120 records

✅ rest_day_patterns
4 records

✅ routes
10 records

✅ users

✅ replacement_assignments

ARCHITEKTURA:

React
↓
REST API
↓
Express
↓
Services / Business Logic
↓
PostgreSQL

PostgreSQL + backend są SOURCE OF TRUTH.

STATUS:

🟢 GOTOWE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ ETAP 3 — AUTHENTICATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Login UI
✅ bcrypt
✅ password hashing
✅ JWT
✅ session
✅ logout
✅ role zapisane w użytkowniku
✅ protected API

Public:

✅ POST /login

Protected:

✅ /drivers
✅ /duties
✅ /routes
✅ /weekly-snapshot
✅ Operations API
✅ Incidents API

Frontend wysyła JWT.

Sprawdzone:

✅ request bez tokena → 401
✅ request z tokenem → 200

UWAGA:

Role istnieją w systemie,
ale pełne ROLE PERMISSIONS będą domknięte w module ADMIN.

STATUS:

🟢 AUTH GOTOWE
🟡 ROLE PERMISSIONS JESZCZE DO ZROBIENIA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ ETAP 4 — BACKEND BUSINESS LOGIC / ALLOCATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Logika Allocation / Rota została przeniesiona
z frontendu na backend.

Backend odpowiada za business rules.

Frontend:

❌ nie wylicza zasad operacyjnych
✅ pobiera wynik
✅ renderuje wynik

Weekly Snapshot działa przez backend.

Allocation / PDF działa.

STATUS:

🟢 GOTOWE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ ETAP 5 — OPERATIONS ENGINE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Operations Engine obsługuje:

✅ unavailable drivers
✅ sickness / unavailable status
✅ rest days
✅ spare drivers
✅ current rota week
✅ today's Duty
✅ replacement candidates
✅ assignment date
✅ replacement assignment
✅ PostgreSQL persistence
✅ COVERED
✅ UNCOVERED

Replacement rules:

✅ replacement musi być spare
✅ replacement musi być available
✅ właściwy current rota week
✅ replacement nie może być użyty drugi raz tego dnia
✅ absent driver nie może być pokryty drugi raz
✅ Duty nie może być pokryte drugi raz
✅ Duty musi pasować do route / rota kierowcy

Database protection:

✅ UNIQUE replacement driver + date
✅ UNIQUE absent driver + date
✅ UNIQUE duty + date

Operations Board:

✅ pokazuje problemy
✅ pokazuje Duty
✅ pokazuje Date
✅ pokazuje replacement candidates
✅ Assign
✅ zapis do PostgreSQL
✅ refresh UI
✅ COVERED — zielony
✅ UNCOVERED — czerwony
✅ pokazuje kto przejął Duty
✅ active issues liczą tylko UNCOVERED

Pełny flow:

React
↓
POST assignment
↓
Express
↓
business validation
↓
PostgreSQL
↓
GET issues
↓
React refresh

STATUS:

🟢 GOTOWE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟡 ETAP 6 — TESTING FOUNDATION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Framework:

✅ Vitest

Automated tests:

✅ getCurrentRotaWeek
✅ 7 / 7 tests PASS

Sprawdzone przypadki:

✅ less than one week
✅ next rota week
✅ multiple weeks
✅ four-week wrap
✅ different starting rota week
✅ week 4 before full week
✅ week 4 → week 1

Quality:

✅ npm run lint
0 warnings
0 errors

✅ npx tsc --noEmit
0 errors

Manual / integration:

✅ authentication 401 / 200
✅ Operations assignment
✅ PostgreSQL INSERT
✅ duplicate replacement protection
✅ duplicate absent-driver protection
✅ duplicate Duty protection
✅ COVERED workflow
✅ UI refresh

DO DOMKNIĘCIA PÓŹNIEJ:

□ kilka najważniejszych API validation tests
□ auth / role permission tests
□ incident tests
□ Sign-On tests
□ Reports tests

Nie budujemy ogromnego enterprise test suite.

STATUS:

🟡 SOLIDNA BAZA GOTOWA
FINALNE TESTY PO POZOSTAŁYCH MODUŁACH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 ETAP 7 — INCIDENTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cel:

prawdziwy, niewielki moduł Incidents
dla Operations / Service Control.

Zakres:

✅ tabela incidents w PostgreSQL
✅ incident_type
✅ description
✅ status: open / resolved
✅ optional route
✅ optional driver_number
✅ created_at
✅ resolved_at
✅ driver_number FK → drivers(employee_number)
✅ CHECK status open / resolved

API:

✅ GET /incidents
✅ POST /incidents
✅ PATCH /incidents/:id/resolve
✅ JWT protection

UI:

✅ IncidentsPage
✅ Incident Log
✅ create incident
✅ resolve incident
✅ loading / submitting / error state
✅ OPEN / RESOLVED badges
✅ historia resolved incidents pozostaje w logu

VALIDATION:

✅ driver musi istnieć w drivers
✅ route musi istnieć w routes
✅ invalid driver → Driver number does not exist
✅ invalid route → Route does not exist

TESTY MANUALNE:

✅ create → PostgreSQL → GET → UI
✅ resolve → resolved_at → UI
✅ invalid driver rejected
✅ invalid route rejected
✅ TypeScript PASS
✅ lint 0 warnings / 0 errors

ZASADA DOMENOWA:

Incidents = zdarzenia operacyjne Service Control.

❌ nie budujemy modułu engineering / fleet maintenance
❌ brak Delete dla kontrolera
❌ brak enterprise ticketing
❌ brak 20 statusów

STATUS:

🟢 FUNKCJONALNIE GOTOWE
🟡 finalny Git / merge do zamknięcia

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 ETAP 8 — SIGN-ON SHEET + NAVIGATION CLEANUP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NAWIGACJA:

□ usunąć Vehicles
□ dodać Sign-On Sheet

Finalne główne moduły:

Dashboard
Drivers
Duties
Allocation
Operations Board
Incidents
Sign-On Sheet
Reports
Admin

SIGN-ON SHEET:

Cel:

dzienny arkusz operacyjny pokazujący kierowców
i ich pracę na dany dzień.

Minimum:

□ data operacyjna
□ employee number
□ driver name
□ route
□ duty number
□ sign-on
□ sign-off
□ status operacyjny

Statusy minimum:

□ EXPECTED
□ SIGNED ON
□ LATE
□ ABSENT

Źródła:

PostgreSQL
↓
backend
↓
drivers / duties / rota
↓
Sign-On Sheet

ZASADA:

PostgreSQL = source of truth.
Backend przygotowuje dane dla dnia.
React renderuje wynik i interaction flow.

Generowanie:

□ sheet dostępny dla konkretnej daty
□ możliwość przygotowania danych na następny dzień

Nie budujemy osobnego wielkiego scheduler engine.

STATUS:

🔴 TODO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 ETAP 9 — DASHBOARD FINAL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Obecnie:

✅ podstawowa strona Dashboard istnieje

Do domknięcia:

□ prawdziwe dane z backendu
□ active operational issues
□ open incidents
□ sign-on summary
□ late / absence summary
□ podstawowe operational totals
□ bez hardcoded demo statistics

ZASADA:

Dashboard pokazuje tylko dane,
które naprawdę istnieją w systemie.

Nie robimy:

❌ BI dashboard
❌ dziesiątek wykresów

STATUS:

🔴 TODO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 ETAP 10 — ADMIN + ROLE PERMISSIONS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Obecnie:

✅ login
✅ users w PostgreSQL
✅ manager / controller zapisane w DB
✅ role w JWT / user

❌ realne różnice uprawnień

Do zrobienia:

□ AdminPage
□ Manager / Controller permissions
□ backend authorization
□ ukrywanie / blokowanie niedozwolonych akcji w UI
□ minimum sensownego zarządzania użytkownikami / rolami

ZASADA:

Frontend może ukrywać funkcję,
ale BACKEND musi egzekwować permission.

STATUS:

🔴 TODO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 ETAP 11 — REPORTS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cel:

mały, realistyczny moduł raportów operacyjnych.

Minimum:

□ ReportsPage
□ dane z backendu / PostgreSQL
□ Late Sign-On report
□ Absence report
□ Incidents report
□ filtr po dacie / sensownym okresie
□ podstawowe podsumowanie
□ PDF / export tylko tam, gdzie ma sens

Raporty wynikają z realnych danych systemu,
a nie z hardcoded demo values.

Nie robimy:

❌ systemu BI
❌ analytics platform
❌ kilkunastu raportów dla samego CV

STATUS:

🔴 TODO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 ETAP 12 — FINAL TESTING PASS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Operations rules
□ replacement rules
□ Incidents
□ Sign-On Sheet
□ Dashboard
□ Reports
□ API validation
□ auth
□ roles / permissions
□ important edge cases

Potem:

□ npm test -- --run
□ npm run lint
□ npx tsc --noEmit
□ manual UI smoke test

CEL:

🟢 tests PASS
🟢 lint clean
🟢 TypeScript clean
🟢 core flows działają

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 ETAP 13 — AI OPERATIONS ASSISTANT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JEDNA DOBRA FUNKCJA AI.

Scenariusz:

driver unavailable
↓
backend business rules
↓
VALID replacement candidates
↓
AI
↓
ranking / recommendation
↓
krótkie uzasadnienie
↓
Controller podejmuje decyzję

NAJWAŻNIEJSZA ZASADA:

🔥 BACKEND = RULES
🤖 AI = SUGGESTION

AI NIE może:

❌ łamać business rules
❌ samodzielnie wymyślać kierowców
❌ być source of truth
❌ omijać PostgreSQL

AI dostaje tylko kandydatów,
których backend wcześniej uznał za VALID.

STATUS:

🔴 TODO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🐳 ETAP 14 — DOCKER + PRODUCTION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Docker
□ backend container
□ production configuration
□ environment variables
□ usunąć hardcoded secrets
□ production PostgreSQL
□ production build
□ sprawdzić frontend ↔ backend ↔ DB

STATUS:

🔴 TODO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌍 ETAP 15 — DEPLOYMENT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ frontend live
□ backend live
□ production database
□ demo account
□ login działa
□ Operations działa
□ Incidents działa
□ Sign-On Sheet działa
□ Reports działa
□ AI działa
□ mobile/basic responsive check

STATUS:

🔴 TODO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 ETAP 16 — PORTFOLIO / README / FINAL POLISH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

README:

□ problem biznesowy
□ rozwiązanie
□ screenshots
□ architecture
□ stack
□ PostgreSQL
□ API
□ auth
□ Operations Engine
□ Incidents
□ Sign-On Sheet
□ Reports
□ AI architecture
□ testing
□ Docker
□ Live Demo

GitHub:

□ clean main
□ sensowne commity
□ brak martwych branchy
□ brak sekretów
□ repo wygląda profesjonalnie

Portfolio:

□ Bus Operations Simulator jako HERO PROJECT
□ Live Demo
□ GitHub
□ krótki opis problem → rozwiązanie

╔══════════════════════════════════════════════════════════════╗
║ 🏁 FAZA 1 — TARGET ║
║ ~20.10.2026 ║
╚══════════════════════════════════════════════════════════════╝

BUS OPERATIONS SIMULATOR:

React + TypeScript
↓
Express REST API
↓
Business Logic
↓
PostgreSQL
↓
Authentication / Authorization
↓
Operations Engine
↓
Incidents
↓
Sign-On Sheet
↓
Dashboard
↓
Admin / Role Permissions
↓
Reports
↓
Testing
↓
AI Assistant
↓
Docker
↓
Production
↓
LIVE DEMO

🔥 FAZA 1 COMPLETE

╔══════════════════════════════════════════════════════════════╗
║ 🏢 FAZA 2 — WORK LIKE A DEVELOPER ║
║ ~20.10.2026 → ║
╚══════════════════════════════════════════════════════════════╝

Tutaj zmieniamy sposób pracy.

AI NIE daje mi od razu gotowego rozwiązania.

Workflow:

Jira Ticket
↓
czytam requirement
↓
analizuję problem
↓
tworzę branch
↓
JA piszę kod
↓
testuję
↓
commit
↓
Pull Request
↓
Code Review
↓
poprawki
↓
muszę wyjaśnić rozwiązanie

Ćwiczymy:

□ debugging
□ bug fixes
□ small features
□ refactoring
□ tests
□ API
□ React
□ TypeScript
□ PostgreSQL
□ Git
□ Pull Requests
□ Code Review

NAJWAŻNIEJSZE PYTANIE:

„Czy potrafię wyjaśnić,
po co ten kod istnieje
i jak działa?”

Jeżeli NIE:
→ wracamy do niego.

Jeżeli TAK:
→ idziemy dalej.

╔══════════════════════════════════════════════════════════════╗
║ 🇵🇱 FAZA 3 — POLSKA ║
╚══════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 HARMONOGRAM WEJŚCIA NA RYNEK

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

20.10.2026 → 30.11.2026

🧠 FAZA 2 — intensywna nauka projektu

📨 tylko pojedyncze aplikacje testujące rynek

01.12.2026 → 31.12.2026

🧠 dalsza nauka

🎤 interview preparation

📨 selektywne aplikowanie

🔥 01.01.2027 — START PEŁNEGO APLIKOWANIA W POLSCE

FAZA 2 i aplikowanie mogą działać równolegle.

Target:

📍 Kraków
📍 Rzeszów
🏠 Remote PL
🚗 Hybrid 1–2 dni / tydzień

Role:

□ Junior Software Developer
□ Junior Full-Stack Developer
□ Junior React / TypeScript Developer
□ Software Developer
□ Internal Tools Developer
□ transport / logistics / scheduling software

NARRACJA:

NIE:

„kolejny junior React”

TYLKO:

„Mam wieloletnie doświadczenie operacyjne w transporcie
i zbudowałem pełny system rozwiązujący problem,
który znam z prawdziwej pracy.”

Bus Operations Simulator = HERO PROJECT.

🎯 GŁÓWNY TARGET:

01.01.2027

Jestem przygotowany do regularnego szukania
pierwszej pracy developerskiej w Polsce.

╔══════════════════════════════════════════════════════════════╗
║ 🔥 HARD RULES ║
╚══════════════════════════════════════════════════════════════╝

1. Nie dokładamy technologii dla CV.

2. Nie overengineeringujemy.

3. Backend odpowiada za business rules.

4. PostgreSQL jest source of truth.

5. React odpowiada za UI i interaction flow.

6. AI tylko sugeruje — nie łamie reguł.

7. Każdy ważny flow musi działać end-to-end.

8. Kod ma wyglądać jak solidny Junior / Junior+,
   nie jak wygenerowana architektura seniora.

9. FAZA 1:
   BUILD FAST.

10. FAZA 2:
    LEARN DEEPLY.

11. Muszę potrafić wyjaśnić własny projekt.

12. Ten dokument jest FINAL MASTER PLAN.
    Nowe uzgodnione wymagania aktualizujemy tutaj,
    zamiast tworzyć nową konkurencyjną roadmapę.

13. Po ukończeniu FINAL SCOPE:
    STOP dokładaniu nowych dużych funkcji.
    Priorytetem staje się nauka, samodzielność
    i przygotowanie do pracy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 CURRENT POSITION — 01.10.2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PostgreSQL ✅
Backend / API ✅
Allocation backend ✅
Auth / JWT ✅
Operations Engine ✅
Replacement workflow ✅
Testing foundation ✅
Incidents 🟢 funkcjonalnie gotowe / Git do zamknięcia

Vehicles ❌ usunąć
Sign-On Sheet ⏳
Dashboard final ⏳
Admin permissions ⏳
Reports ⏳
Final testing ⏳
AI Assistant ⏳
Docker ⏳
Production ⏳
Deployment ⏳
README / Live Demo ⏳

🔥 FINALNA KOLEJNOŚĆ OD TERAZ

Incidents Git / merge
↓
Vehicles removal + Sign-On Sheet
↓
Dashboard final
↓
Admin + Role Permissions
↓
Reports
↓
Final Testing Pass
↓
AI Operations Assistant
↓
Docker + Production
↓
Deployment
↓
README / Architecture / Live Demo
↓
FAZA 2 — Work Like a Developer
↓
20.10–30.11 — nauka + pojedyncze aplikacje testowe
↓
01.12–31.12 — nauka + interview prep + selektywne aplikacje
↓
🔥 01.01.2027 — PEŁNE APLIKOWANIE POLSKA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
