# Лестница предложений COLLIMA — черновик

> **Под A+B, не утверждено владельцем.** Цены и ставки — из [решения № 1](decision-01-positioning.md) (15.11.2026), все цены «от», итог после ТЗ. Не оферта. Подготовил отдел продаж 16.11.2026 для аудитора sales-auditor. Внешних действий нет: ничего не отправлено.

---

## RU — версия для СНГ (цены — столбец «СНГ»)

**Как это работает.** Вы начинаете с малого и дорогого не покупаете: сначала аудит или проверка, потом разработка. Каждая ступень заканчивается документом или образцом, по которому видно, продолжать ли.

| # | Ступень | Что получаете на руки | Срок | От | Следующий шаг |
|---|---|---|---|---|---|
| 1 | Технический аудит / ТЭО | Архитектура, риски, план и смета | 1–2 нед | $1 500 | Выбрать вариант из сметы и перейти к ТЗ и этапу 3–7 |
| 2 | Design review / DFM платы | Отчёт с замечаниями и приоритетами | 3–7 дней | $700 | Исправить замечания самим или заказать разводку (ступень 3) |
| 3 | Разводка платы 2–4 слоя | Комплект файлов для производства | 2–3 нед | $600 | Пилотная партия или прототип (ступень 6) |
| 4 | Разводка 6–8 слоёв с DDR | То же + расчёт импеданса | 4–6 нед | $2 000 | Прототип устройства |
| 5 | Разводка 10–14 слоёв high-speed ⚠️ | То же + SI/PI-моделирование | 6–10 нед | $4 000 | Прототип устройства |
| 6 | Прототип IoT-устройства | Работающий образец + документация | 8–14 нед | $8 000 | Пилотная партия, выделенная группа |
| 7 | Прототип измерительной системы / стенда ⚠️ | Работающий образец + документация | 10–16 нед | $12 000 | Доработка по результатам испытаний, серия |
| 8 | Лазерная измерительная система под заказ ⚠️ — **проверка конечного пользователя и назначения** | Работающий образец + документация | 12–20 нед | $15 000 | Испытания у заказчика, доработка |
| 9 | Выделенная группа | Инженеры в команде заказчика | от 3 мес | $25–35 / ч (гипотеза) | Продление или переход на проектную работу |

**Чек.** Для СНГ цены — строго по столбцу выше, отдельного минимального чека нет. Ставка группы $25–35/ч — гипотеза, ждёт решения владельца.

**Оплата.**
- Поэтапная предоплата: этап — не дольше 4–6 недель, аванс 30–50 %, работа начинается после зачисления денег. Закупка «железа» и прототипов — 100 % вперёд.
- Первый проверочный платёж: небольшой реальный этап (примерно 5–10 % бюджета, например аудит), основной договор — после зачисления.
- Режим OUR: комиссии банков платит заказчик. Платит сторона договора со своего счёта.
- Только законные каналы: никаких третьих лиц, чужих счетов, «платёжных агентов», криптовалюты.

**Важно.**
- Сроки — ориентир от получения ТЗ и аванса; точный срок и цена фиксируются после ТЗ. Результат — то, что указано в колонке «Что получаете»; сертификацию, испытания в лаборатории и закупку компонентов цена не включает.
- ⚠️ — оценка без прямых рыночных данных, проверяем на первых запросах.
- Лазерные позиции — только гражданские проекты; перед договором — проверка конечного пользователя и назначения. Мы вправе отказаться от проекта по итогам проверки.
- Гарантировать, что банк проведёт платёж, мы не можем: проверочный платёж нужен, чтобы сначала проверить маршрут.

---

## EN — International version (prices — "International" column)

> **Under A+B, not approved by the owner.** Draft; all prices are "from", final price after the technical specification. Not an offer.

**How it works.** Start small: audit or review first, development second. Every step ends with a document or a sample, so you can decide whether to continue.

| # | Step | What you receive | Lead time | From | Next step |
|---|---|---|---|---|---|
| 1 | Technical audit / feasibility study | Architecture, risks, plan and estimate | 1–2 wks | $3 000 | Choose an option from the estimate; move to the specification |
| 2 | Design review / DFM of your PCB | Report with findings and priorities | 3–7 days | $1 500 | Fix findings in-house or order layout (step 3) |
| 3 | PCB layout, 2–4 layers | Manufacturing data package | 2–3 wks | $1 500 | Pilot batch or prototype (step 6) |
| 4 | Layout, 6–8 layers with DDR | Same + impedance calculation | 4–6 wks | $4 000 | Device prototype |
| 5 | Layout, 10–14 layers, high-speed ⚠️ | Same + SI/PI simulation | 6–10 wks | $8 000 | Device prototype |
| 6 | IoT device prototype | Working sample + documentation | 8–14 wks | $15 000 | Pilot batch, dedicated team |
| 7 | Measurement system / test-stand prototype ⚠️ | Working sample + documentation | 10–16 wks | $25 000 | Rework after testing, series |
| 8 | Custom laser measurement system ⚠️ — **end-user and end-use check** | Working sample + documentation | 12–20 wks | $30 000 | Testing at your site, rework |
| 9 | Dedicated team | Engineers inside your team | from 3 months | $45–55 / h | Extension or switch to fixed-scope projects |

**Minimum order: $1 500** (international customers only). Smaller items are sold as part of a project.

**Payment terms.**
- Staged prepayment: each stage is at most 4–6 weeks, 30–50 % advance, work starts after the funds are credited. Hardware and prototype purchases are paid 100 % upfront.
- First verification payment: a small real stage (about 5–10 % of the budget, e.g. the audit); the main contract is signed after it is credited.
- OUR: all bank charges, including intermediary banks, are borne by the customer. Payment only from the customer's own account.
- Legitimate channels only: no third parties, no third-party accounts, no payment agents, no crypto.

**Please note.**
- Lead times are indicative, counted from receipt of the specification and advance; price and timeline are fixed after the specification. The deliverable is what the "What you receive" column states; lab testing, certification and component procurement are not included.
- ⚠️ means an estimate without direct market data, to be validated on the first inquiries.
- Laser items are for civil projects only and require an end-user and end-use check before the contract; we may decline a project based on the result. Some lasers and sensors are dual-use items; each project is screened individually.
- We cannot guarantee that a bank will process a payment: the verification payment exists to test the route first.

---

## Для аудитора: сверка с решением № 1
- Цены ступеней 1–8 совпадают с таблицей «Продукты-входы», сроки и «что получает заказчик» — тоже; ⚠️ на ступенях 5, 7, 8 сохранены. Ставка группы СНГ $25–35/ч, международная $45–55/ч.
- Минимальный чек $1 500 — только в EN-версии; в RU его нет.
- Условия оплаты — из [banks-payments](../../reports/2026-11-15-banks-payments.md), раздел 5 (проверочный платёж, этапы, OUR). Названия банков и маршруты в клиентский текст не вынесены.
- Открытые вопросы владельцу (из решения № 1): держать ли ставку СНГ $25–35/ч, подтвердить ли минимальный чек $1 500; ⚖️ по условиям платежа и валютному договору — юрист.
- «Следующий шаг» и пометка о проверке конечного пользователя — формулировки отдела продаж, в решении № 1 их нет.
