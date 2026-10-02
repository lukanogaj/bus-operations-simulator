# 🚌 BUS OPERATIONS SIMULATOR

# 🚀 FINAL MASTER PLAN — UPDATE 02.10.2026

---

# 🎯 GŁÓWNY CEL

Zbudować kompletny **Bus Operations Simulator** jako HERO PROJECT pod wejście na rynek Software / Full-Stack Development.

## Target

🇵🇱 Polska  
📍 Kraków / Rzeszów / Remote PL  
💼 Junior / Junior+ Software / Full-Stack Developer

## Stack

⚛️ React + TypeScript  
🟢 Node.js + Express  
🐘 PostgreSQL

Projekt ma pokazywać:

- ✅ realny problem biznesowy
- ✅ doświadczenie domenowe transportu
- ✅ frontend
- ✅ backend
- ✅ PostgreSQL
- ✅ REST API
- ✅ authentication / authorization
- ✅ business logic
- ✅ testing
- ✅ Docker
- ✅ deployment
- ✅ AI integration

Nie budujemy enterprise-monolitu.

Budujemy:

🔥 **mały, kompletny, profesjonalny system operacyjny, który potrafię później samodzielnie wyjaśnić.**

---

# 🔒 FINAL SCOPE LOCK

W FINAL SCOPE są:

- ✅ Dashboard operacyjny
- ✅ Drivers
- ✅ Duties
- ✅ Allocation
- ✅ Operations Board
- ✅ Incidents
- 🔄 Sign-On Sheet
- ⏳ Reports
- ⏳ Admin + Role Permissions
- ⏳ Testing
- ⏳ AI Operations Assistant
- ⏳ Docker / Production / Deployment
- ⏳ README / Architecture / Live Demo

Poza FINAL SCOPE:

- ❌ Vehicles / fleet management
- ❌ engineering / mechanical workflow
- ❌ rozbudowany BI
- ❌ enterprise ticketing
- ❌ niepotrzebny overengineering

**Flight Manifest — późniejszy uzgodniony dodatek. Nie implementujemy go teraz.**

---

# 🟢 FAZA 1 — BUILD FAST

# ✅ ETAP 1 — CORE APPLICATION

Gotowe:

- ✅ React + TypeScript
- ✅ Vite
- ✅ layout / sidebar
- ✅ Drivers
- ✅ Duties
- ❌ Vehicles — usuwamy z finalnego scope
- ✅ Allocation
- ✅ weekly rota
- ✅ PDF generation

Dashboard:

- 🟡 podstawowa baza istnieje
- finalny dashboard operacyjny zostanie domknięty później

**STATUS: 🟢 CORE DZIAŁA**

---

# ✅ ETAP 2 — POSTGRESQL + BACKEND

Gotowe:

- ✅ PostgreSQL
- ✅ Express backend
- ✅ REST API

## Database

- ✅ drivers — 160 records
- ✅ duties — 120 records
- ✅ rest_day_patterns — 4 records
- ✅ routes — 10 records
- ✅ users
- ✅ replacement_assignments
- ✅ incidents
- ✅ sign_on_entries

## Architektura

React  
↓  
REST API  
↓  
Express  
↓  
Services / Business Logic  
↓  
PostgreSQL

**PostgreSQL + backend = SOURCE OF TRUTH.**

**STATUS: 🟢 GOTOWE**

---

# ✅ ETAP 3 — AUTHENTICATION

Gotowe:

- ✅ Login UI
- ✅ bcrypt
- ✅ password hashing
- ✅ JWT
- ✅ session
- ✅ logout
- ✅ role zapisane w użytkowniku
- ✅ protected API

Public:

- ✅ `POST /login`

Protected:

- ✅ `/drivers`
- ✅ `/duties`
- ✅ `/routes`
- ✅ `/weekly-snapshot`
- ✅ Operations API
- ✅ Incidents API
- ✅ Sign-On API

Frontend wysyła JWT.

Sprawdzone:

- ✅ request bez tokena → 401
- ✅ request z tokenem → 200

Role istnieją, ale pełne ROLE PERMISSIONS domykamy później w ADMIN.

**STATUS: 🟢 AUTH GOTOWE**

---

# ✅ ETAP 4 — BACKEND BUSINESS LOGIC / ALLOCATION

Logika Allocation / Rota została przeniesiona z frontendu na backend.

Backend odpowiada za business rules.

Frontend:

- ❌ nie wylicza zasad operacyjnych
- ✅ pobiera wynik
- ✅ renderuje wynik

Weekly Snapshot działa przez backend.

Allocation / PDF działa.

**STATUS: 🟢 GOTOWE**

---

# ✅ ETAP 5 — OPERATIONS ENGINE

Operations Engine obsługuje:

- ✅ unavailable drivers
- ✅ sickness / unavailable status
- ✅ rest days
- ✅ spare drivers
- ✅ current rota week
- ✅ today's Duty
- ✅ replacement candidates
- ✅ assignment date
- ✅ replacement assignment
- ✅ PostgreSQL persistence
- ✅ COVERED
- ✅ UNCOVERED

## Replacement rules

Replacement:

- musi być `spare`
- musi być `available`
- musi pasować do właściwego current rota week
- nie może być użyty drugi raz tego samego dnia
- absent driver nie może być pokryty drugi raz
- Duty nie może być pokryte drugi raz
- Duty / rota musi być zgodne z business rules

## Database protection

- ✅ UNIQUE replacement driver + date
- ✅ UNIQUE absent driver + date
- ✅ UNIQUE duty + date

## Operations Board

- ✅ pokazuje problemy
- ✅ pokazuje Duty
- ✅ pokazuje Date
- ✅ pokazuje replacement candidates
- ✅ Assign
- ✅ zapis do PostgreSQL
- ✅ refresh UI
- ✅ COVERED — zielony
- ✅ UNCOVERED — czerwony
- ✅ pokazuje kto przejął Duty
- ✅ active issues liczą tylko UNCOVERED

Flow:

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

**STATUS: 🟢 GOTOWE**

---

# 🟡 ETAP 6 — TESTING FOUNDATION

Framework:

- ✅ Vitest

Automated:

- ✅ `getCurrentRotaWeek`
- ✅ 7/7 PASS

Sprawdzone:

- less than one week
- next rota week
- multiple weeks
- four-week wrap
- different starting rota week
- week 4 before full week
- week 4 → week 1

Quality:

- ✅ `npm run lint`
- ✅ 0 warnings
- ✅ 0 errors
- ✅ `npx tsc --noEmit`
- ✅ PASS

Manual / integration:

- authentication 401 / 200
- Operations assignment
- PostgreSQL INSERT
- duplicate replacement protection
- duplicate absent-driver protection
- duplicate Duty protection
- COVERED workflow
- UI refresh

Do późniejszego finalnego testing pass:

- API validation tests
- auth / role permissions
- incidents
- Sign-On
- Reports

Nie budujemy ogromnego enterprise test suite.

**STATUS: 🟡 SOLIDNA BAZA**

---

# ✅ ETAP 7 — INCIDENTS

## Cel

Realny, niewielki moduł Incidents dla Operations / Service Control.

## PostgreSQL

Tabela `incidents`:

- incident_type
- description
- status: `open / resolved`
- optional route
- optional driver_number
- created_at
- resolved_at
- FK driver
- CHECK status

## API

- ✅ `GET /incidents`
- ✅ `POST /incidents`
- ✅ `PATCH /incidents/:id/resolve`
- ✅ JWT protection

## UI

- IncidentsPage
- Incident Log
- create
- resolve
- loading / submitting / error
- OPEN / RESOLVED
- historia resolved pozostaje

## Validation

- driver musi istnieć
- route musi istnieć
- invalid driver rejected
- invalid route rejected

Brak Delete dla controllera.

Nie budujemy engineering/fleet maintenance ani enterprise ticketingu.

**STATUS: 🟢 FUNKCJONALNIE GOTOWE**

---

# 🔄 ETAP 8 — SIGN-ON SHEET + NAVIGATION CLEANUP

## Nawigacja

Finalne główne moduły:

- Dashboard
- Drivers
- Duties
- Allocation
- Operations Board
- Incidents
- **Sign-On Sheet**
- Reports
- Admin

Vehicles usuwamy.

---

# 🚌 SIGN-ON SHEET — FINAL BUSINESS SPECIFICATION

## 1. Cel

Sign-On Sheet jest **dziennym arkuszem operacyjnym** pokazującym wszystkie Duties wymagające obsady oraz kierowców, którzy mają zgłosić się do pracy.

Sign-On Sheet odpowiada za:

**MONITORING PRZYJŚCIA KIEROWCY DO PRACY.**

Nie jest drugim Operations Board.

---

# 2. FUNDAMENTALNA REGUŁA

Jeżeli danego dnia operacyjnego istnieje:

**90 Duties wymagających obsady**

to finalny Sign-On Sheet powinien reprezentować:

**90 Duties.**

Nie:

79 tylko dlatego, że 11 nominalnych kierowców jest unavailable.

Przykład:

90 Duties  
↓  
79 available nominal drivers

- 11 prawidłowo dobranych spare/replacement drivers  
  ↓  
  **90 pozycji Sign-On**

Jeżeli nie można znaleźć VALID replacement dla któregoś Duty, Duty **nie może zniknąć**.

Musi pozostać widoczne jako problem / unassigned / uncovered.

---

# 3. ODPOWIEDZIALNOŚĆ OPERATIONS VS SIGN-ON

## Operations / backend assignment logic

Odpowiada za:

- wykrycie unavailable nominal driver
- znalezienie VALID spare candidates
- walidację business rules
- wybór / przygotowanie replacement
- zapis `replacement_assignment`
- zapewnienie prawidłowej obsady

## Sign-On

Odpowiada za:

- odczyt przygotowanej obsady
- pokazanie kto ma przyjść
- pokazanie Duty
- pokazanie godzin
- monitorowanie sign-on
- LATE
- SIGNED_ON
- ABSENT

### HARD RULE

**Sign-On nie może sam omijać Operations business rules.**

Nie może:

- wymyślać kierowcy
- brać dowolnego kierowcy
- omijać PostgreSQL
- łamać rota rules
- przypisać tego samego spare dwa razy
- ukrywać brakującego Duty

---

# 4. AUTOMATYCZNE UZUPEŁNIENIE SPARE DRIVERS

To jest część finalnego wymaganego flow.

Przed przygotowaniem kompletnego Sign-On Sheet backend ma ustalić obsadę dnia.

Dla każdego Duty:

### A — nominal driver AVAILABLE

Nominalny kierowca pozostaje na Duty.

### B — nominal driver UNAVAILABLE

Np.:

- holiday
- training
- sick / planned unavailable

Backend szuka **VALID spare driver**.

### VALID spare musi:

- być `spare`
- być `available`
- być właściwy dla aktualnego rota week / reguł systemu
- być zgodny z wymaganiami Duty
- nie być już wykorzystany tego dnia
- przejść istniejące Operations business rules

Jeżeli valid spare istnieje:

backend tworzy / wykorzystuje prawidłowy:

`replacement_assignment`

i ten replacement driver trafia do Sign-On zamiast nominalnego unavailable drivera.

### C — brak VALID spare

System:

**NIE przypisuje przypadkowego kierowcy.**

Duty pozostaje:

**UNCOVERED / UNASSIGNED**

i musi być widoczne dla Operations/Controllera.

---

# 5. WAŻNA ZASADA DOTYCZĄCA ABSENCE

`holiday`, `training` i planned unavailability:

**NIE są Sign-On ABSENT.**

To są planowane / znane wcześniej problemy z obsadą.

Powinny być rozwiązane przez Operations/replacement workflow przed rozpoczęciem Duty.

`ABSENT` w Sign-On oznacza coś innego:

> Kierowca był rzeczywiście oczekiwany na Duty, ale nie zgłosił się i Controller potwierdził no-show.

Tak samo:

master status `sick` nie oznacza automatycznie Sign-On `ABSENT`.

---

# 6. POLA SIGN-ON SHEET

Minimum:

- operational date
- employee number
- driver name
- route
- duty number
- sign-on time
- sign-off time
- operational/sign-on status

Później UI może również jasno wskazywać:

- nominal driver
- replacement driver
- uncovered Duty

jeżeli jest to potrzebne dla czytelności operacyjnej.

---

# 7. STATUSY SIGN-ON

Finalne podstawowe statusy:

### EXPECTED

Kierowca jest zaplanowany i jeszcze nie zbliżył się czas sign-on.

### DUE

**10 minut przed scheduled sign-on time.**

### LATE

Scheduled sign-on time minął, a kierowca nadal nie został signed on.

### SIGNED_ON

Controller zarejestrował przyjście kierowcy.

System zapisuje:

`signed_on_at`

### ABSENT

Controller ręcznie potwierdził rzeczywisty no-show.

ABSENT nie jest automatycznie ustawiany tylko dlatego, że kierowca ma status `sick`, `holiday` albo `training`.

---

# 8. PRZYKŁAD CZASOWY

Duty:

`sign_on = 14:00`

Status:

13:30  
→ `EXPECTED`

13:50  
→ `DUE`

14:01 i brak sign-on  
→ `LATE`

14:03 controller rejestruje kierowcę  
→ `SIGNED_ON`

Jeżeli kierowca faktycznie się nie pojawi:

controller potwierdza  
→ `ABSENT`

---

# 9. KOLORY

Kolory są **derived UI state**.

Nie zapisujemy kolorów w PostgreSQL.

Przykładowo UI może wizualnie odróżniać:

- EXPECTED
- DUE
- LATE
- SIGNED_ON
- ABSENT
- UNCOVERED

ale DB przechowuje dane/status, a nie kolor.

---

# 10. DATABASE — SIGN-ON

Tabela:

`sign_on_entries`

Obecnie:

- id
- operational_date
- driver_number
- duty_number
- signed_on_at
- status
- created_at

Constraints:

- UNIQUE operational_date + driver_number
- UNIQUE operational_date + duty_number

FK:

- driver_number → drivers(employee_number)
- duty_number → duties(duty_number)

Dozwolone statusy:

- EXPECTED
- DUE
- SIGNED_ON
- LATE
- ABSENT

Jeżeli model będzie wymagał reprezentowania uncovered Duty bez drivera, dopasujemy schema świadomie podczas implementacji — bez obchodzenia constraints na siłę.

---

# 11. OBECNY STAN GENERATORA — 02.10.2026

Endpoint:

`POST /sign-on/generate`

Body:

`operationalDate`

Endpoint:

- protected JWT
- wymaga daty
- waliduje `YYYY-MM-DD`
- używa backend service
- PostgreSQL pozostaje source of truth

Aktualna wersja generatora została przetestowana dla:

`2026-10-03`

Nominal Duties:

**90**

Unavailable nominal drivers:

**11**

Available nominal drivers:

**79**

Wynik obecnego generatora:

**79 Sign-On entries**

Sprawdzone w PostgreSQL:

- dokładnie 79 rows
- wszystkie `EXPECTED`
- zero `holiday`
- zero `sick`
- zero `training`
- zero automatycznie utworzonych `replacement_assignments`

### STATUS OBECNEGO CORE

🟢 **PASS**

To jest jednak tylko pierwszy etap generatora.

---

# 12. NASTĘPNY KROK — 79 → 90

Teraz rozwijamy generator/Operations preparation tak, aby pozostałe Duties zostały prawidłowo obsłużone.

Cel testowego dnia:

**79 nominal available**

- # **11 valid spare/replacement**
  **90 covered Sign-On positions**

O ile baza rzeczywiście zawiera wystarczającą liczbę VALID spare drivers spełniających business rules.

Jeżeli valid spare jest mniej:

np.

79 nominal

- 9 valid spare  
  = 88 covered

pozostałe:

2 Duties

muszą pozostać widoczne jako:

**UNCOVERED / UNASSIGNED**

Nie wolno sztucznie osiągać 90 kosztem złamania business rules.

---

# 13. GENEROWANIE NEXT-DAY SIGN-ON

Docelowo Sign-On Sheet przygotowujemy na następny dzień operacyjny.

Scheduler:

każdego dnia około:

**00:00 Europe/London**

system przygotowuje Sign-On Sheet dla następnego operational day.

Nie budujemy wielkiego scheduler engine.

Ma być prosto.

Przed wyborem dependency sprawdzamy istniejący `package.json`.

---

# 14. STARTUP / ACCESS FALLBACK

Jeżeli backend nie działał o północy:

po uruchomieniu / pierwszym wymaganym dostępie system ma idempotentnie sprawdzić:

> Czy wymagany next-day Sign-On Sheet istnieje?

Jeżeli nie:

→ przygotować go.

Generator musi być **idempotentny**.

Nie może tworzyć duplikatów.

---

# 15. SIGN-ON READ API

Po przygotowaniu obsady:

GET/read API umożliwia pobranie Sign-On Sheet dla konkretnej daty.

Response powinien dostarczyć UI m.in.:

- date
- driver
- employee number
- route
- duty
- sign-on
- sign-off
- status
- informację potrzebną do pokazania replacement/uncovered, jeśli dotyczy

React nie oblicza business rules.

Backend przygotowuje dane.

---

# 16. CONTROLLER ACTION — SIGNED ON

Controller może oznaczyć kierowcę:

`SIGNED_ON`

Backend zapisuje:

`signed_on_at`

oraz właściwy status.

---

# 17. CONTROLLER ACTION — ABSENT

Controller może ręcznie oznaczyć rzeczywisty no-show:

`ABSENT`

ABSENT nie może powstawać automatycznie tylko dlatego, że minęła godzina sign-on.

Po przekroczeniu czasu automatyczny stan to:

`LATE`

Dopiero decyzja controllera:

`ABSENT`

---

# 18. REACT SIGN-ON PAGE

UI ma być operacyjne i proste.

Ma umożliwiać szybkie zobaczenie:

- kto ma się zgłosić
- na jakie Duty
- na jakiej route
- o której sign-on
- o której sign-off
- kto jest EXPECTED
- kto jest DUE
- kto jest LATE
- kto SIGNED_ON
- kto został potwierdzony ABSENT
- które Duty pozostaje UNCOVERED

Bez niepotrzebnego dashboardowego overengineeringu.

---

# 19. SIGN-ON TESTS

Testujemy przede wszystkim business-critical flows:

- available nominal driver → included
- unavailable nominal driver → nie pojawia się jako EXPECTED
- valid existing replacement → replacement pojawia się
- automatic valid spare preparation
- invalid spare → rejected
- duplicate spare → rejected
- duplicate Duty → rejected
- insufficient spare → Duty remains uncovered
- EXPECTED logic
- DUE logic
- LATE logic
- SIGNED_ON
- ABSENT manual confirmation
- scheduler idempotency
- startup fallback
- JWT protection

Na końcu:

- `npm test -- --run`
- `npm run lint`
- `npx tsc --noEmit`

---

# 20. SIGN-ON ARCHITECTURE

PostgreSQL  
↓  
Drivers / Duties / Rota / Replacement Assignments  
↓  
Operations Business Rules  
↓  
Daily Duty Coverage  
↓  
Sign-On Generator  
↓  
Sign-On API  
↓  
React Sign-On Page  
↓  
Controller actions

Fundamentalna zasada:

**PostgreSQL = DATA SOURCE OF TRUTH**

**Backend = BUSINESS RULES**

**React = UI / INTERACTION**

---

# 21. SIGN-ON + AI — PÓŹNIEJ

AI nie jest potrzebne do podstawowego działania Sign-On.

Później AI może:

- otrzymać wyłącznie VALID spare candidates
- rankingować ich
- zasugerować najlepszego kandydata
- krótko uzasadnić sugestię

Ale:

**AI nigdy nie może ominąć backend business rules.**

---

# 22. SIGN-ON — KOLEJNOŚĆ IMPLEMENTACJI OD TERAZ

1. ✅ podstawowy `sign_on_entries`
2. ✅ POST `/sign-on/generate`
3. ✅ nominal available drivers
4. ✅ 79/90 test PASS
5. 🔄 sprawdzić strukturę i pulę spare drivers
6. 🔄 automatyczne przygotowanie VALID spare/replacements
7. 🔄 osiągnąć pełne pokrycie Duties, jeśli valid spare istnieją
8. GET/read API
9. SIGNED_ON action
10. ABSENT action
11. dynamic EXPECTED / DUE / LATE
12. duty sign-on / sign-off w response
13. scheduler next-day
14. startup/access fallback
15. React Sign-On Page
16. Sign-On tests
17. TypeScript
18. lint
19. Git checkpoint

**Nie przeskakujemy etapów.**

---

# 🔴 ETAP 9 — DASHBOARD FINAL

Dashboard pobiera prawdziwe dane z backendu.

Minimum:

- active operational issues
- open incidents
- sign-on summary
- late / absence summary
- podstawowe operational totals

Bez hardcoded demo statistics.

Dashboard pokazuje tylko dane, które naprawdę istnieją.

Nie robimy BI platformy.

---

# 🔴 ETAP 10 — ADMIN + ROLE PERMISSIONS

Obecnie:

- login
- users
- manager/controller
- role w JWT

Do zrobienia:

- AdminPage
- Manager / Controller permissions
- backend authorization
- blokowanie niedozwolonych akcji
- minimum zarządzania użytkownikami/rolami

Frontend może ukrywać funkcję.

**Backend musi egzekwować permission.**

---

# 🔴 ETAP 11 — REPORTS

Minimum:

- ReportsPage
- backend/PostgreSQL data
- Late Sign-On report
- Absence report
- Incidents report
- filtr daty / okresu
- podstawowe podsumowanie
- PDF/export tylko tam, gdzie ma sens

Raporty wynikają z realnych danych.

Nie robimy BI.

---

# 🔴 ETAP 12 — FINAL TESTING PASS

Testujemy:

- Operations rules
- replacement rules
- Incidents
- Sign-On
- Dashboard
- Reports
- API validation
- auth
- roles / permissions
- important edge cases

Na końcu:

`npm test -- --run`

`npm run lint`

`npx tsc --noEmit`

manual UI smoke test

Target:

🟢 tests PASS  
🟢 lint clean  
🟢 TypeScript clean  
🟢 core flows działają

---

# 🤖 ETAP 13 — AI OPERATIONS ASSISTANT

Jedna dobra funkcja AI.

Flow:

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

Najważniejsze:

🔥 BACKEND = RULES  
🤖 AI = SUGGESTION

AI nie może:

- łamać business rules
- wymyślać kierowców
- być source of truth
- omijać PostgreSQL

---

# 🐳 ETAP 14 — DOCKER + PRODUCTION

- Docker
- backend container
- production configuration
- environment variables
- usunąć hardcoded secrets
- production PostgreSQL
- production build
- frontend ↔ backend ↔ DB

---

# 🌍 ETAP 15 — DEPLOYMENT

- frontend live
- backend live
- production database
- demo account
- login
- Operations
- Incidents
- Sign-On
- Reports
- AI
- basic responsive check

---

# 📚 ETAP 16 — PORTFOLIO / README / FINAL POLISH

README:

- problem biznesowy
- rozwiązanie
- screenshots
- architecture
- stack
- PostgreSQL
- API
- auth
- Operations Engine
- Incidents
- Sign-On Sheet
- Reports
- AI architecture
- testing
- Docker
- Live Demo

GitHub:

- clean main
- sensowne commity
- brak martwych branchy
- brak sekretów
- profesjonalne repo

Portfolio:

**Bus Operations Simulator = HERO PROJECT**

- Live Demo
- GitHub
- krótki problem → rozwiązanie

---

# 🏁 FAZA 1 — TARGET

Target:

**~20.10.2026**

Final architecture:

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

🔥 **FAZA 1 COMPLETE**

---

# 🏢 FAZA 2 — WORK LIKE A DEVELOPER

Po zakończeniu budowy zmieniamy sposób pracy.

AI nie daje od razu gotowego rozwiązania.

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

- debugging
- bug fixes
- small features
- refactoring
- tests
- API
- React
- TypeScript
- PostgreSQL
- Git
- Pull Requests
- Code Review

Najważniejsze pytanie:

**„Czy potrafię wyjaśnić, po co ten kod istnieje i jak działa?”**

Jeżeli nie:

→ wracamy.

Jeżeli tak:

→ idziemy dalej.

---

# 🇵🇱 FAZA 3 — POLSKA

## Harmonogram wejścia na rynek

### 20.10.2026 → 30.11.2026

- intensywna nauka projektu
- pojedyncze aplikacje testujące rynek

### 01.12.2026 → 31.12.2026

- dalsza nauka
- interview preparation
- selektywne aplikowanie

### 🔥 01.01.2027

**START PEŁNEGO APLIKOWANIA W POLSCE**

Target:

📍 Kraków  
📍 Rzeszów  
🏠 Remote PL  
🚗 Hybrid 1–2 dni / tydzień

Role:

- Junior Software Developer
- Junior Full-Stack Developer
- Junior React / TypeScript Developer
- Software Developer
- Internal Tools Developer
- transport / logistics / scheduling software

Narracja:

Nie:

**„kolejny junior React”**

Tylko:

**„Mam wieloletnie doświadczenie operacyjne w transporcie i zbudowałem pełny system rozwiązujący problem, który znam z prawdziwej pracy.”**

Bus Operations Simulator = HERO PROJECT.

---

# 🔥 HARD RULES

1. Nie dokładamy technologii dla CV.

2. Nie overengineeringujemy.

3. Backend odpowiada za business rules.

4. PostgreSQL jest source of truth.

5. React odpowiada za UI i interaction flow.

6. AI tylko sugeruje — nie łamie reguł.

7. Każdy ważny flow musi działać end-to-end.

8. Kod ma wyglądać jak solidny Junior / Junior+, nie jak wygenerowana architektura seniora.

9. FAZA 1 = **BUILD FAST.**

10. FAZA 2 = **LEARN DEEPLY.**

11. Muszę potrafić wyjaśnić własny projekt.

12. Ten dokument jest **FINAL MASTER PLAN**.

13. Nowe uzgodnione wymagania aktualizujemy tutaj zamiast tworzyć konkurencyjne roadmapy.

14. Po ukończeniu FINAL SCOPE: **STOP dokładaniu dużych funkcji.**

15. Priorytetem staje się nauka, samodzielność i przygotowanie do pracy.

16. Sign-On Sheet musi odzwierciedlać **wszystkie Duties wymagające obsady**, a nie tylko kierowców nominalnie available.

17. System nigdy nie może osiągać pełnej obsady przez złamanie business rules.

18. Jeżeli nie ma VALID spare drivera, Duty pozostaje **UNCOVERED**, zamiast dostać nieprawidłowego kierowcę.

---

# 📍 CURRENT POSITION — 02.10.2026

PostgreSQL ✅  
Backend / API ✅  
Allocation backend ✅  
Auth / JWT ✅  
Operations Engine ✅  
Replacement workflow ✅  
Testing foundation ✅  
Incidents ✅  
Vehicles ❌ usunąć  
Sign-On Sheet 🔄 **W TRAKCIE**

## Sign-On checkpoint

Database `sign_on_entries` ✅

`POST /sign-on/generate` ✅

JWT protection ✅

Test date:

**2026-10-03**

Nominal Duties:

**90**

Unavailable nominal drivers:

**11**

Available nominal:

**79**

Generated:

**79 EXPECTED**

Database verification:

**79 rows ✅**

Unavailable drivers in Sign-On:

**0 ✅**

All current rows EXPECTED:

**79 ✅**

Replacement assignments automatically created by current generator:

**0 ✅**

### NEXT

🔥 **79 → 90**

Sprawdzić spare drivers w PostgreSQL i zbudować prawidłowe automatyczne przygotowanie replacementów zgodnie z Operations business rules.

Potem:

Sign-On GET API  
↓  
SIGNED_ON / ABSENT  
↓  
dynamic statuses  
↓  
scheduler  
↓  
React Sign-On UI  
↓  
tests  
↓  
Git checkpoint

Następnie:

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
🔥 **01.01.2027 — PEŁNE APLIKOWANIE POLSKA**

---

# 🔒 AKTUALNY NEXT STEP

Branch:

`feature/sign-on-sheet`

Nie robimy teraz:

- schedulera
- React UI
- Dashboardu
- Reports
- AI

Robimy:

**sprawdzenie struktury `drivers` i sposobu identyfikacji spare drivers w PostgreSQL.**

Następnie:

**VALID spare selection → replacement assignments → pełna dzienna obsada → Sign-On Sheet.**

Jeden logiczny krok naraz.

# END — FINAL MASTER PLAN 02.10.2026
