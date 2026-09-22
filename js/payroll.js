import { sb, setSync } from './db.js';

const DATA = {"employees":[{"id":"galya","full":"Шашкова Галина","short":"Галя","role":"Продажи","title":"РОП"},{"id":"glafira","full":"Шишерина Глафира","short":"Глафира","role":"Продажи","title":"МОП"},{"id":"lena","full":"Благородова Лена","short":"Лена","role":"Продажи","title":"МОП"},{"id":"sasha","full":"Дергунова Саша","short":"Саша","role":"Активации"},{"id":"yana","full":"Мамуткина Яна","short":"Яна","role":"Активации"},{"id":"anya","full":"Фарукова Анна","short":"Аня","role":"Активации"},{"id":"milana","full":"Милана","short":"Милана","role":"Разовая"},{"id":"vasilisa","full":"Василиса","short":"Василиса","role":"Продукт","title":"Продакт Менеджер"},{"id":"anastasia","full":"Анастасия","short":"Анастасия","role":"Продукт","title":"Менеджер по работе с партнерами"},{"id":"ekaterina","full":"Екатерина","short":"Екатерина","role":"Продукт","title":"Младший менеджер"},{"id":"marina","full":"Марина","short":"Марина","role":"Администраторы"},{"id":"alina","full":"Алина","short":"Алина","role":"Администраторы"},{"id":"pavel","full":"Павел","short":"Павел","role":"Маркетплейсы","title":"Менеджер по маркетплейсам"},{"id":"ilya","full":"Илья","short":"Илья","role":"Разработка","title":"Разработчик"},{"id":"nikita","full":"Никита","short":"Никита","role":"Руководство","title":"Операционный директор"}],"schedule":[{"id":"p1","emp":"galya","date":"2026-07-05","amount":87828.0,"type":"ЗП","paid":true,"note":null,"month":"ИЮЛЬ"},{"id":"p2","emp":"glafira","date":"2026-07-05","amount":90208.0,"type":"ЗП","paid":true,"note":null,"month":"ИЮЛЬ"},{"id":"p3","emp":"sasha","date":"2026-07-05","amount":48000.0,"type":"ЗП","paid":true,"note":null,"month":"ИЮЛЬ"},{"id":"p4","emp":"yana","date":"2026-07-05","amount":53000.0,"type":"ЗП","paid":true,"note":null,"month":"ИЮЛЬ"},{"id":"p5","emp":"lena","date":"2026-07-15","amount":25021.0,"type":"ЗП","paid":true,"note":null,"month":"ИЮЛЬ"},{"id":"p6","emp":"anya","date":"2026-07-15","amount":23660.0,"type":"ЗП","paid":true,"note":null,"month":"ИЮЛЬ"},{"id":"p7","emp":"milana","date":"2026-07-21","amount":45000.0,"type":"ЗП","paid":true,"note":null,"month":"ИЮЛЬ"},{"id":"p8","emp":"galya","date":"2026-07-25","amount":30000.0,"type":"Аванс","paid":true,"note":null,"month":"ИЮЛЬ"},{"id":"p9","emp":"glafira","date":"2026-07-25","amount":40000.0,"type":"Аванс","paid":true,"note":null,"month":"ИЮЛЬ"},{"id":"p10","emp":"sasha","date":"2026-07-25","amount":30000.0,"type":"Аванс","paid":true,"note":null,"month":"ИЮЛЬ"},{"id":"p11","emp":"yana","date":"2026-07-25","amount":30000.0,"type":"Аванс","paid":true,"note":null,"month":"ИЮЛЬ"},{"id":"p12","emp":"lena","date":"2026-08-01","amount":40000.0,"type":"Аванс","paid":true,"note":null,"month":"АВГУСТ"},{"id":"p13","emp":"anya","date":"2026-08-01","amount":30000.0,"type":"Аванс","paid":true,"note":null,"month":"АВГУСТ"},{"id":"p14","emp":"galya","date":"2026-08-07","amount":93641.0,"type":"ЗП","paid":true,"note":null,"month":"АВГУСТ"},{"id":"p15","emp":"glafira","date":"2026-08-07","amount":94158.0,"type":"ЗП","paid":true,"note":null,"month":"АВГУСТ"},{"id":"p16","emp":"sasha","date":"2026-08-07","amount":48400.0,"type":"ЗП","paid":true,"note":null,"month":"АВГУСТ"},{"id":"p17","emp":"yana","date":"2026-08-07","amount":53400.0,"type":"ЗП","paid":true,"note":null,"month":"АВГУСТ"},{"id":"p18","emp":"lena","date":"2026-08-14","amount":67652.0,"type":"ЗП","paid":true,"note":null,"month":"АВГУСТ"},{"id":"p19","emp":"anya","date":"2026-08-14","amount":53400.0,"type":"ЗП","paid":true,"note":null,"month":"АВГУСТ"},{"id":"p20","emp":"galya","date":"2026-08-24","amount":40000.0,"type":"Аванс","paid":false,"note":null,"month":"АВГУСТ"},{"id":"p21","emp":"glafira","date":"2026-08-24","amount":40000.0,"type":"Аванс","paid":false,"note":null,"month":"АВГУСТ"},{"id":"p22","emp":"sasha","date":"2026-08-24","amount":30000.0,"type":"Аванс","paid":false,"note":null,"month":"АВГУСТ"},{"id":"p23","emp":"yana","date":"2026-08-24","amount":30000.0,"type":"Аванс","paid":false,"note":null,"month":"АВГУСТ"},{"id":"p24","emp":"lena","date":"2026-09-01","amount":40000.0,"type":"Аванс","paid":false,"note":null,"month":"СЕНТЯБРЬ"},{"id":"p25","emp":"anya","date":"2026-09-01","amount":30000.0,"type":"Аванс","paid":false,"note":null,"month":"СЕНТЯБРЬ"},{"id":"p26","emp":"galya","date":"2026-09-10","amount":60000.0,"type":"ЗП","paid":false,"note":null,"month":"СЕНТЯБРЬ"},{"id":"p27","emp":"glafira","date":"2026-09-10","amount":42600.0,"type":"ЗП","paid":false,"note":null,"month":"СЕНТЯБРЬ"},{"id":"p28","emp":"sasha","date":"2026-09-10","amount":49000.0,"type":"ЗП","paid":false,"note":null,"month":"СЕНТЯБРЬ"},{"id":"p29","emp":"yana","date":"2026-09-10","amount":56000.0,"type":"ЗП","paid":false,"note":null,"month":"СЕНТЯБРЬ"},{"id":"p30","emp":"lena","date":"2026-09-15","amount":48800.0,"type":"ЗП","paid":false,"note":null,"month":"СЕНТЯБРЬ"},{"id":"p31","emp":"anya","date":"2026-09-15","amount":56000.0,"type":"ЗП","paid":false,"note":null,"month":"СЕНТЯБРЬ"},{"id":"p32","emp":"galya","date":"2026-09-25","amount":40000.0,"type":"Аванс","paid":false,"note":null,"month":"СЕНТЯБРЬ"},{"id":"p33","emp":"glafira","date":"2026-09-25","amount":40000.0,"type":"Аванс","paid":false,"note":null,"month":"СЕНТЯБРЬ"},{"id":"p34","emp":"sasha","date":"2026-09-25","amount":30000.0,"type":"Аванс","paid":false,"note":null,"month":"СЕНТЯБРЬ"},{"id":"p35","emp":"yana","date":"2026-09-25","amount":30000.0,"type":"Аванс","paid":false,"note":null,"month":"СЕНТЯБРЬ"}],"calc":{"ИЮНЬ":{"galya":[{"label":"Часы","value":172.0},{"label":"Оклад, руб","value":80000.0},{"label":"план по лидам","value":2156000.0},{"label":"выручка по лидам","value":2572797.0},{"label":"коэффициент","value":1.0},{"label":"% за выручку по лидам","value":119.3319573},{"label":"Премия за лиды","value":20000},{"label":"План время ответа","value":25.0},{"label":"Факт время ответа","value":30.0},{"label":"коэффициент","value":0.0},{"label":"Премия за ответы","value":0},{"label":"Выполнение плана","value":10000.0},{"label":"Личные продажи","value":391411.0},{"label":"% с личных продаж","value":2.0},{"label":"Бонус за личные продажи","value":7828.22},{"label":"Всего зп, руб","value":117828.22},{"label":"Аванс","value":30000.0},{"label":"ЗП (в конце месяца)","value":87828.22},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 5 и 20","value":null}],"glafira":[{"label":"Часы, офис","value":157.0},{"label":"Оклад, руб","value":40000.0},{"label":"Выручка по лидам","value":1284152.0},{"label":"Конверсия по лидам","value":0.8172},{"label":"Премия за конверсию","value":64207.6},{"label":"Выполнение плана","value":20000.0},{"label":"Скорость ответа на обращения","value":0.0},{"label":"Скорость перезвона","value":0.0},{"label":"Аттестация по знанию продукта","value":3000.0},{"label":"Закрытие хотя бы 1 B2B-сделки","value":3000.0},{"label":"Всего зп, руб","value":130207.6},{"label":"Аванс","value":40000.0},{"label":"ЗП (в конце месяца)","value":90207.6},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 5 и 20","value":null}],"lena":[{"label":"Часы, офис","value":22.0},{"label":"Оклад, руб","value":5330.0},{"label":"Выручка по лидам","value":156367.0},{"label":"Конверсия по лидам","value":0.7},{"label":"Премия за конверсию","value":4691.01},{"label":"Выполнение плана","value":0.0},{"label":"Скорость ответа на обращения","value":0.0},{"label":"Скорость перезвона","value":0.0},{"label":"Аттестация по знанию продукта","value":0.0},{"label":"Закрытие хотя бы 1 B2B-сделки","value":0.0},{"label":"Всего зп, руб","value":10021.01},{"label":"Обучение","value":15000.0},{"label":"ЗП (15 июля!!)","value":10021.01},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 1 и 15","value":null}],"sasha":[{"label":"Часы, офис","value":135.0},{"label":"Оклад, руб","value":65000.0},{"label":"Бонус за положительные отзывы","value":2000.0},{"label":"Именной отзыв","value":0.0},{"label":"Бонус за NPS выше 90","value":3000.0},{"label":"% записей в день активации > 50%","value":0.0},{"label":"Выполнение плана компании","value":5000.0},{"label":"Скорость ответа < 15 минут","value":0.0},{"label":"Аттестация по сервисной политике","value":3000.0},{"label":"Всего зп, руб","value":78000},{"label":"Аванс","value":30000.0},{"label":"ЗП (в конце месяца)","value":48000},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 5 и 20","value":null}],"yana":[{"label":"Часы, офис","value":135.0},{"label":"Оклад, руб","value":65000.0},{"label":"Бонус за положительные отзывы","value":2000.0},{"label":"Именной отзыв","value":0.0},{"label":"Бонус за NPS выше 90","value":3000.0},{"label":"% записей в день активации > 50%","value":0.0},{"label":"Выполнение плана компании","value":5000.0},{"label":"Скорость ответа < 15 минут","value":5000.0},{"label":"Аттестация по сервисной политике","value":3000.0},{"label":"Всего зп, руб","value":83000},{"label":"Аванс","value":30000.0},{"label":"ЗП (в конце месяца)","value":53000},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 5 и 20","value":null},{"label":"Яне тысяча компенсация за оплату по себесу","value":null}],"anya":[{"label":"Часы, офис","value":18.0},{"label":"Оклад, руб","value":8660.0},{"label":"Бонус за положительные отзывы","value":0.0},{"label":"Именной отзыв","value":0.0},{"label":"Бонус за NPS выше 90","value":0.0},{"label":"% записей в день активации > 50%","value":0.0},{"label":"Выполнение плана компании","value":0.0},{"label":"Скорость ответа < 15 минут","value":0.0},{"label":"Аттестация по сервисной политике","value":0.0},{"label":"Всего зп, руб","value":8660},{"label":"Обучение","value":15000.0},{"label":"ЗП (15 июля!!)","value":15000},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 1 и 15","value":null}]},"ИЮЛЬ":{"galya":[{"label":"Часы","value":120.0},{"label":"Оклад, руб","value":80000.0},{"label":"план по лидам","value":2000000.0},{"label":"выручка по лидам","value":2645603.0},{"label":"коэффициент","value":1.2},{"label":"% за выручку по лидам","value":132.28015},{"label":"Премия за лиды","value":24000},{"label":"План время ответа","value":15.0},{"label":"Факт время ответа","value":18.0},{"label":"коэффициент","value":0.5},{"label":"Премия за ответы","value":10000},{"label":"Выполнение плана","value":10000.0},{"label":"Личные продажи","value":92050.0},{"label":"% с личных продаж","value":2.0},{"label":"Бонус за личные продажи","value":1841},{"label":"Вычет за ДР","value":2200.0},{"label":"Всего зп, руб","value":123641},{"label":"Аванс","value":30000.0},{"label":"ЗП (7 августа)","value":93641},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 5 и 20","value":null}],"glafira":[{"label":"Часы, офис","value":168.0},{"label":"Оклад, руб","value":42666.0},{"label":"Выручка по лидам","value":1481837.0},{"label":"Конверсия по лидам","value":0.85},{"label":"Премия за конверсию","value":74091.85},{"label":"Выполнение плана","value":10000.0},{"label":"Скорость ответа на обращения","value":3000.0},{"label":"Скорость перезвона","value":0.0},{"label":"Аттестация по знанию продукта","value":3000.0},{"label":"Закрытие хотя бы 1 B2B-сделки","value":3000.0},{"label":"Вычет за ДР","value":1600.0},{"label":"Всего зп, руб","value":134157.85},{"label":"Аванс","value":40000.0},{"label":"ЗП (7 августа)","value":94157.85},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 5 и 20","value":null}],"lena":[{"label":"Часы, офис","value":157.0},{"label":"Оклад, руб","value":42666.0},{"label":"Выручка по лидам","value":1071716.0},{"label":"Конверсия по лидам","value":0.85},{"label":"Премия за конверсию","value":53585.8},{"label":"Выполнение плана","value":10000.0},{"label":"Скорость ответа на обращения","value":0.0},{"label":"Скорость перезвона","value":0.0},{"label":"Аттестация по знанию продукта","value":3000.0},{"label":"Закрытие хотя бы 1 B2B-сделки","value":0.0},{"label":"Вычет за ДР","value":1600.0},{"label":"Всего зп, руб","value":107651.8},{"label":"Аванс","value":40000.0},{"label":"ЗП (15 августа)","value":67651.8},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 1 (ав) и 15 (бонусы)","value":null}],"sasha":[{"label":"Часы, офис","value":135.0},{"label":"Оклад, руб","value":65000.0},{"label":"Бонус за положительные отзывы","value":4000.0},{"label":"Именной отзыв","value":0.0},{"label":"Бонус за NPS выше 90","value":3000.0},{"label":"% записей в день активации > 50%","value":0.0},{"label":"Выполнение плана компании","value":5000.0},{"label":"Скорость ответа < 15 минут","value":0.0},{"label":"Аттестация по сервисной политике","value":3000.0},{"label":"Всего зп, руб","value":78400},{"label":"Вычет за ДР","value":1600.0},{"label":"Аванс","value":30000.0},{"label":"ЗП (7 августа)","value":48400},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 5 и 20","value":null}],"yana":[{"label":"Часы, офис","value":135.0},{"label":"Оклад, руб","value":65000.0},{"label":"Бонус за положительные отзывы","value":4000.0},{"label":"Именной отзыв","value":0.0},{"label":"Бонус за NPS выше 90","value":3000.0},{"label":"% записей в день активации > 50%","value":0.0},{"label":"Выполнение плана компании","value":5000.0},{"label":"Скорость ответа < 15 минут","value":5000.0},{"label":"Аттестация по сервисной политике","value":3000.0},{"label":"Всего зп, руб","value":83400},{"label":"Вычет за ДР","value":1600.0},{"label":"Аванс","value":30000.0},{"label":"ЗП (7 августа)","value":53400},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 5 и 20","value":null}],"anya":[{"label":"Часы, офис","value":135.0},{"label":"Оклад, руб","value":65000.0},{"label":"Бонус за положительные отзывы","value":4000.0},{"label":"Именной отзыв","value":0.0},{"label":"Бонус за NPS выше 90","value":3000.0},{"label":"% записей в день активации > 50%","value":0.0},{"label":"Выполнение плана компании","value":5000.0},{"label":"Скорость ответа < 15 минут","value":5000.0},{"label":"Аттестация по сервисной политике","value":3000.0},{"label":"Всего зп, руб","value":83400},{"label":"Вычет за ДР","value":1600.0},{"label":"Аванс","value":30000.0},{"label":"ЗП (15 августа)","value":53400},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 1 (ав) и 15 (бонусы)","value":null}]},"АВГУСТ":{"galya":[{"label":"Часы","value":160.0},{"label":"Оклад, руб","value":85000.0},{"label":"план по лидам","value":2500000.0},{"label":"выручка по лидам","value":1670000.0},{"label":"Перевыполнение","value":0.0},{"label":"Премия за лиды","value":0.0},{"label":"Отзывы","value":0.0},{"label":"План время ответа","value":15.0},{"label":"Факт время ответа","value":11.0},{"label":"Премия за ответы","value":6000.0},{"label":"Премия за конверсию","value":6000.0},{"label":"План по возвратам","value":0.0},{"label":"План (сайт)","value":0.0},{"label":"Продажи В2В","value":null},{"label":"% с продаж В2В","value":2.0},{"label":"Бонус за В2В","value":0},{"label":"Вычет за ДР","value":400.0},{"label":"Всего зп, руб","value":96600},{"label":"Аванс","value":40000.0},{"label":"ЗП (7 августа)","value":56600},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 10 и 25","value":null}],"glafira":[{"label":"Часы, офис","value":160.0},{"label":"Оклад, руб","value":40000.0},{"label":"Выручка по лидам","value":712441.0},{"label":"Конверсия по лидам","value":0.85},{"label":"Премия за конверсию","value":35622.05},{"label":"Выполнение плана","value":null},{"label":"Отзывы","value":0.0},{"label":"% ответов до 15 минут","value":4000.0},{"label":"Оценка качества (QA)","value":3000.0},{"label":"Подписка в ТГ","value":null},{"label":"Вычет за ДР","value":null},{"label":"Всего зп, руб","value":82622.05},{"label":"Аванс","value":40000.0},{"label":"ЗП (10 сентября)","value":42622.05},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 10 и 25","value":null}],"lena":[{"label":"Часы, офис","value":160.0},{"label":"Оклад, руб","value":40000.0},{"label":"Выручка по лидам","value":796439.0},{"label":"Конверсия по лидам","value":0.85},{"label":"Премия за конверсию","value":39821.95},{"label":"Выполнение плана","value":null},{"label":"Отзывы","value":0.0},{"label":"% ответов до 15 минут","value":6000.0},{"label":"Оценка качества (QA)","value":3000.0},{"label":"Подписка в ТГ","value":0.0},{"label":"Вычет за ДР","value":null},{"label":"Всего зп, руб","value":88821.95},{"label":"Аванс","value":40000.0},{"label":"ЗП (15 сентября)","value":48821.95},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 1 (аванс) и 15 (бонусы)","value":null}],"sasha":[{"label":"Часы, офис","value":135.0},{"label":"Оклад, руб","value":65000.0},{"label":"Бонус за положительные отзывы","value":0.0},{"label":"Кол-во активаций","value":3000.0},{"label":"Время записи","value":3000.0},{"label":"% ответов до 15 минут","value":0.0},{"label":"Оценка качества (QA)","value":5000.0},{"label":"NPS выше 90","value":3000.0},{"label":"Выполнение плана компании","value":0.0},{"label":"Всего зп, руб","value":79000},{"label":"Вычет за ДР","value":null},{"label":"Аванс","value":30000.0},{"label":"ЗП (10 сентября)","value":49000},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 10 и 25","value":null}],"yana":[{"label":"Часы, офис","value":135.0},{"label":"Оклад, руб","value":65000.0},{"label":"Бонус за положительные отзывы","value":null},{"label":"Кол-во активаций","value":3000.0},{"label":"Время записи","value":3000.0},{"label":"% ответов до 15 минут","value":7000.0},{"label":"Оценка качества (QA)","value":5000.0},{"label":"NPS выше 90","value":3000.0},{"label":"Выполнение плана компании","value":0.0},{"label":"Всего зп, руб","value":86000},{"label":"Вычет за ДР","value":null},{"label":"Аванс","value":30000.0},{"label":"ЗП (10 сентября)","value":56000},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 10 и 25","value":null}],"anya":[{"label":"Часы, офис","value":135.0},{"label":"Оклад, руб","value":65000.0},{"label":"Бонус за положительные отзывы","value":0.0},{"label":"Кол-во активаций","value":3000.0},{"label":"Время записи","value":3000.0},{"label":"% ответов до 15 минут","value":7000.0},{"label":"Оценка качества (QA)","value":5000.0},{"label":"NPS выше 90","value":3000.0},{"label":"Выполнение плана компании","value":0.0},{"label":"Всего зп, руб","value":86000},{"label":"Вычет за ДР","value":null},{"label":"Аванс","value":30000.0},{"label":"ЗП (15 сентября)","value":56000},{"label":"Отпускные, руб","value":null},{"label":"Даты выплат - 1 (аванс) и 15 (бонусы)","value":null}]}},"calcMonthOrder":["ИЮНЬ","ИЮЛЬ","АВГУСТ"]};

/* ================= helpers ================= */
const empById = id => DATA.employees.find(e => e.id === id);
const roleLabel = emp => emp.title || emp.role;
const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const RU_MONTHS = ['ЯНВАРЬ','ФЕВРАЛЬ','МАРТ','АПРЕЛЬ','МАЙ','ИЮНЬ','ИЮЛЬ','АВГУСТ','СЕНТЯБРЬ','ОКТЯБРЬ','НОЯБРЬ','ДЕКАБРЬ'];
// "Current month" for this tool is a property of the dataset (the last month in calcMonthOrder,
// i.e. the one still marked "план"), NOT the viewer's real device clock — using new Date() here
// broke silently for any visitor whose system date isn't in this month, since fixed-salary
// employees only get their schedule rows seeded "from the current month onward" (see
// seedProductDept) and the schedule tab defaults its month filter the same way.
// Текущий месяц — по календарю (раньше брался последний месяц из исходных данных и застревал на августе).
const CURRENT_MONTH = RU_MONTHS[new Date().getMonth()];
// Месяц, который открывается по умолчанию во вкладках выплат — настоящий календарный месяц по
// московскому времени. CURRENT_MONTH выше трогать нельзя: от него зависит засев графика.
function todayMonthLabel(){
  try {
    const m = Number(new Intl.DateTimeFormat('en-US', {timeZone:'Europe/Moscow', month:'numeric'}).format(new Date()));
    if (m >= 1 && m <= 12) return RU_MONTHS[m - 1];
  } catch(e){}
  return RU_MONTHS[new Date().getMonth()];
}
const MONTH_SHORT = {'ЯНВАРЬ':'Янв','ФЕВРАЛЬ':'Фев','МАРТ':'Мар','АПРЕЛЬ':'Апр','МАЙ':'Май','ИЮНЬ':'Июн','ИЮЛЬ':'Июл','АВГУСТ':'Авг','СЕНТЯБРЬ':'Сен','ОКТЯБРЬ':'Окт','НОЯБРЬ':'Ноя','ДЕКАБРЬ':'Дек'};
const ROLES = ['Продажи','Активации','Продукт','Администраторы','Маркетплейсы','Разработка','Руководство'];
const EMP_COLORS = {galya:'#2F6F5E', glafira:'#4E7FA6', lena:'#8A6FA6', sasha:'#B8842E', yana:'#B2555A', anya:'#5E8C4A', milana:'#8C8C82', vasilisa:'#3B5773', anastasia:'#A0785A', ekaterina:'#6E8F8C', marina:'#9B6A3E', alina:'#5A7CA6', pavel:'#7A9B3E', ilya:'#4E6B8E', nikita:'#8E4E6B'};
const ROLE_COLORS = {'Продажи':'#4E7FA6', 'Активации':'#B8842E', 'Продукт':'#7A5D8A', 'Администраторы':'#9B6A3E', 'Маркетплейсы':'#7A9B3E', 'Разработка':'#4E6B8E', 'Руководство':'#8E4E6B'};
const WARN_COLOR = '#B8842E', ACCENT_COLOR = '#2F6F5E';

function parseISO(iso){ const [y,m,d] = iso.split('-').map(Number); return new Date(y, m-1, d); }
function fmtDate(iso){ const [y,m,d] = iso.split('-').map(Number); return d + ' ' + MONTHS_GEN[m-1]; }
function fmtMoney(v){
  if (v === null || v === undefined || isNaN(v)) return '—';
  const decimals = Number.isInteger(v) ? 0 : 2;
  return new Intl.NumberFormat('ru-RU',{minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(v) + ' ₽';
}
function fmtMoneyShort(v){
  if (Math.abs(v) >= 1000) return Math.round(v/1000) + ' тыс ₽';
  return fmtMoney(v);
}
function fmtMoneyCompact(v){
  if (Math.abs(v) >= 1000) return Math.round(v/1000) + 'к';
  return String(v);
}
function fmtNum(v, maxDec){
  maxDec = maxDec === undefined ? 2 : maxDec;
  if (v === null || v === undefined) return '—';
  const decimals = Number.isInteger(v) ? 0 : maxDec;
  return new Intl.NumberFormat('ru-RU',{minimumFractionDigits:0,maximumFractionDigits:decimals}).format(v);
}
function todayMidnight(){ const t = new Date(); t.setHours(0,0,0,0); return t; }
function genId(prefix){ return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
function round2(v){ return Math.round((v + Number.EPSILON) * 100) / 100; }
function nextMonthLabel(m){ return RU_MONTHS[(RU_MONTHS.indexOf(m) + 1) % 12]; }
function monthLabelForDate(iso){ return RU_MONTHS[Number(iso.slice(5,7)) - 1]; }

/* ================= calc-row classification ================= */
const NOTE_EXACT = new Set(['Яне тысяча компенсация за оплату по себесу']);
const HOURS_LABELS = new Set(['Часы','Часы, офис']);
const MINUTES_LABELS = new Set(['План время ответа','Факт время ответа']);
const PERCENT_LABELS = new Set(['% за выручку по лидам','% с личных продаж','% с продаж В2В','Конверсия по лидам']);
const MULTIPLIER_LABELS = new Set(['коэффициент']);
// Verified against every historical month/employee total (see reconciliation): these labels are
// reference/target metrics (hours, plans, revenue, rates) and never sum into "Всего ЗП".
const EXCLUDE_FROM_TOTAL = new Set(['Часы','Часы, офис','план по лидам','выручка по лидам','Выручка по лидам',
  'коэффициент','% за выручку по лидам','План время ответа','Факт время ответа','Личные продажи',
  '% с личных продаж','Конверсия по лидам','% с продаж В2В','План по возвратам','План (сайт)',
  'Продажи В2В','Перевыполнение']);

function classifyCalcRow(label){
  if (label.indexOf('Всего зп') === 0) return 'total';
  if (label === 'Аванс') return 'avans';
  if (label.indexOf('ЗП') === 0 || label === 'Обучение') return 'pay';
  if (label === 'Отпускные, руб') return 'vacation';
  if (label.indexOf('Даты выплат') === 0 || NOTE_EXACT.has(label)) return 'note';
  return 'formula';
}
function rowUnit(label){
  if (HOURS_LABELS.has(label)) return 'ч.';
  if (MINUTES_LABELS.has(label)) return 'мин.';
  if (PERCENT_LABELS.has(label)) return '%';
  if (MULTIPLIER_LABELS.has(label)) return '×';
  return '₽';
}

/* ================= state (persisted editable data) ================= */
const STATE_KEY = 'payroll_care_state_v3';
let state = null;

function migrateEmployeeCalc(month, empId, rows, schedule){
  const formula = [];
  let avansAmount = 0, payAmount = 0, payLabelRaw = '';
  rows.forEach(r => {
    const kind = classifyCalcRow(r.label);
    if (kind === 'formula'){
      formula.push({label:r.label, value:(r.value==null?0:r.value), include: !EXCLUDE_FROM_TOTAL.has(r.label)});
    } else if (kind === 'avans'){
      avansAmount = r.value || 0;
    } else if (kind === 'pay'){
      payAmount = r.value || 0;
      payLabelRaw = r.label;
    }
  });
  // sourceCalcMonth tags whichever schedule row this calc period's Аванс/ЗП actually resolved to,
  // so "Сохранить в график выплат" (see upsertSchedule) can find & update that exact row again
  // later instead of creating a duplicate — matching by calendar month alone doesn't work because
  // the payment's calendar month is usually NOT the same as the calc period's month.
  const avansMatch = schedule.find(it => it.emp === empId && it.month === month && it.type === 'Аванс');
  if (avansMatch) avansMatch.sourceCalcMonth = month;
  const avansDate = avansMatch ? avansMatch.date : null;
  // The "pay" (remainder) portion is historically paid out early in the FOLLOWING month for
  // this whole team, so prefer a next-month schedule match; a same-month or label-parsed date
  // is only a fallback (some rows kept a stale copy-pasted date string from a prior month).
  const nm = nextMonthLabel(month);
  const payMatchNext = schedule.find(it => it.emp === empId && it.type === 'ЗП' && it.month === nm);
  const payMatchSame = schedule.find(it => it.emp === empId && it.type === 'ЗП' && it.month === month);
  const payMatch = payMatchNext || payMatchSame || null;
  let payDate = null;
  if (payMatch){
    payMatch.sourceCalcMonth = month;
    payDate = payMatch.date;
  } else {
    const m = payLabelRaw.match(/(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/);
    if (m){
      const day = Number(m[1]);
      const mi = MONTHS_GEN.indexOf(m[2]);
      if (mi >= 0) payDate = `2026-${String(mi+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    }
  }
  return { rows: formula, avansAmount, avansDate, payAmount, payDate };
}

// Simple fixed-salary/flat-rule employees (product department, administrators, and others outside
// the sales/activations spreadsheet): no historical spreadsheet — just an explicit list of calc
// rows, a fixed Аванс/ЗП day-of-month rule relative to the calc period, and an explicit starting
// ЗП (remainder) amount. Built directly rather than through migrateEmployeeCalc's schedule-matching
// heuristics, which assume messy migrated spreadsheet rows and a "remainder always lands next
// month" pattern that doesn't fit every rule here (Василиса's Аванс itself is paid the month after
// her calc period). `avans:0` means no avans payment at all (e.g. Илья, paid once in full).
// `payAmount` is given explicitly rather than derived from rows, since for percent-based pay
// (Павел, Никита) the remainder isn't oklad-minus-avans — it's entered manually once known.
const PRODUCT_DEPT_RULES = {
  vasilisa:  { rows:[{label:'Оклад, руб', value:200000, include:true}],
    avans:100000, avansMonthOffset:1, avansDay:1,  payMonthOffset:1, payDay:15, payAmount:100000 },
  anastasia: { rows:[{label:'Оклад, руб', value:80000, include:true}],
    avans:30000,  avansMonthOffset:0, avansDay:15, payMonthOffset:1, payDay:3,  payAmount:50000 },
  ekaterina: { rows:[{label:'Оклад, руб', value:80000, include:true}],
    avans:30000,  avansMonthOffset:0, avansDay:15, payMonthOffset:1, payDay:3,  payAmount:50000 },
  marina:    { rows:[{label:'Оклад, руб', value:80000, include:true},{label:'Премия за выполнение плана', value:0, include:true}],
    avans:30000,  avansMonthOffset:0, avansDay:15, payMonthOffset:1, payDay:1,  payAmount:50000 },
  alina:     { rows:[{label:'Оклад, руб', value:70000, include:true},{label:'Премия за выполнение плана', value:0, include:true}],
    avans:20000,  avansMonthOffset:0, avansDay:15, payMonthOffset:1, payDay:1,  payAmount:50000 },
  pavel:     { rows:[{label:'% с продаж на маркетплейсах', value:0, include:true}],
    avans:45000,  avansMonthOffset:0, avansDay:20, payMonthOffset:1, payDay:8,  payAmount:0 },
  ilya:      { rows:[{label:'Оклад, руб', value:182000, include:true}],
    avans:0,       avansMonthOffset:0, avansDay:1,  payMonthOffset:1, payDay:8,  payAmount:182000 },
  nikita:    { rows:[{label:'Процент (%)', value:0, include:true}],
    avans:150000,  avansMonthOffset:1, avansDay:1,  payMonthOffset:1, payDay:15, payAmount:0 },
};
// This tool models one calendar year at a time (see monthSortKey) — a rule that would land past
// December simply isn't scheduled rather than silently mislabeled as next January.
function addMonthsWithinYear(monthLabel, year, offset){
  const idx = RU_MONTHS.indexOf(monthLabel) + offset;
  if (idx > 11) return null;
  return { label: RU_MONTHS[idx], year };
}
function buildProductDeptCalcMonth(empId, month, year){
  const rule = PRODUCT_DEPT_RULES[empId];
  const avansTarget = addMonthsWithinYear(month, year, rule.avansMonthOffset);
  const payTarget = addMonthsWithinYear(month, year, rule.payMonthOffset);
  const dateFor = (target, day) => target ? `${target.year}-${String(RU_MONTHS.indexOf(target.label)+1).padStart(2,'0')}-${String(day).padStart(2,'0')}` : null;
  return {
    rows: rule.rows.map(r => ({...r})),
    avansAmount: rule.avans || 0,
    avansDate: rule.avans ? dateFor(avansTarget, rule.avansDay) : null,
    payAmount: rule.payAmount,
    payDate: dateFor(payTarget, rule.payDay),
  };
}
// Ensures the product-department employees have calc data for every month (including months in an
// existing saved state that predate this department), and seeds their actual ledger rows from the
// current month onward (not retroactively — the department wasn't tracked before it was added).
// Idempotent: re-running never duplicates a row already tagged with that calc period.
function seedProductDept(s){
  RU_MONTHS.forEach(month => {
    if (!s.calc[month]) return;
    const year = s.years[month] || 2026;
    Object.keys(PRODUCT_DEPT_RULES).forEach(empId => {
      if (!s.calc[month][empId]) s.calc[month][empId] = buildProductDeptCalcMonth(empId, month, year);
    });
  });
  const curIdx = RU_MONTHS.indexOf(CURRENT_MONTH);
  RU_MONTHS.forEach((month, idx) => {
    if (idx < curIdx) return; // don't fabricate ledger history for months before the department existed here
    Object.keys(PRODUCT_DEPT_RULES).forEach(empId => {
      const c = s.calc[month] && s.calc[month][empId];
      if (!c) return;
      const hasAvans = s.schedule.some(it => it.emp === empId && it.sourceCalcMonth === month && it.type === 'Аванс');
      const hasPay = s.schedule.some(it => it.emp === empId && it.sourceCalcMonth === month && it.type === 'ЗП');
      if (c.avansDate && !hasAvans){
        const m2 = monthLabelForDate(c.avansDate);
        if (!s.years[m2]) s.years[m2] = Number(c.avansDate.slice(0,4));
        s.schedule.push({id:genId('pd'), emp:empId, date:c.avansDate, amount:c.avansAmount, type:'Аванс', paid:false, note:null, month:m2, sourceCalcMonth:month});
      }
      if (c.payDate && !hasPay){
        const m2 = monthLabelForDate(c.payDate);
        if (!s.years[m2]) s.years[m2] = Number(c.payDate.slice(0,4));
        s.schedule.push({id:genId('pd'), emp:empId, date:c.payDate, amount:c.payAmount, type:'ЗП', paid:false, note:null, month:m2, sourceCalcMonth:month});
      }
    });
  });
}

// Fills in any of the 12 calendar months missing from s.calc, using the metric-row layout of the
// chronologically latest month already present as a template (values start at 0), and bootstraps
// Аванс/ЗП dates & amounts from any matching rows already in the payment schedule. Idempotent —
// safe to call on every load, which is how an existing (pre-"all months") saved state picks up
// the rest of the year without losing anything already entered.
function seedMissingMonths(s){
  const present = Object.keys(s.calc);
  if (!present.length) return;
  const keyOf = label => (s.years[label]||2026) * 12 + RU_MONTHS.indexOf(label);
  const templateMonth = present.slice().sort((a,b)=>keyOf(a)-keyOf(b)).pop();
  const tmpl = s.calc[templateMonth];
  RU_MONTHS.forEach(month => {
    if (s.calc[month]) return;
    const year = s.years[month] || s.years[templateMonth] || 2026;
    s.calc[month] = {};
    Object.keys(tmpl).forEach(empId => {
      if (PRODUCT_DEPT_RULES[empId]){
        s.calc[month][empId] = buildProductDeptCalcMonth(empId, month, year);
        return;
      }
      // Excludes rows already claimed by an earlier calc period's remainder (a ЗП paid on the
      // 15th, say, that lands in THIS calendar month because it's really last month's leftover —
      // see migrateEmployeeCalc's payMatchNext). Without the !it.sourceCalcMonth guard this month
      // would silently adopt that row as its own default ЗП value and steal its tag, breaking
      // "Сохранить в график выплат" for the month that actually owns it (see repairStolenPayTags).
      const avansSched = s.schedule.find(it => it.emp === empId && it.month === month && it.type === 'Аванс' && !it.sourceCalcMonth);
      const zpSched = s.schedule.find(it => it.emp === empId && it.month === month && it.type === 'ЗП' && !it.sourceCalcMonth);
      if (avansSched) avansSched.sourceCalcMonth = month;
      if (zpSched) zpSched.sourceCalcMonth = month;
      s.calc[month][empId] = {
        rows: tmpl[empId].rows.map(r => ({label:r.label, value:0, include:r.include})),
        avansAmount: avansSched ? avansSched.amount : 0,
        avansDate: avansSched ? avansSched.date : null,
        payAmount: zpSched ? zpSched.amount : 0,
        payDate: zpSched ? zpSched.date : null,
      };
    });
    if (!s.years[month]) s.years[month] = year;
    if (!s.monthStatus[month]) s.monthStatus[month] = 'план';
  });
}

// One-time repair for states saved before the !it.sourceCalcMonth guard above existed: a later
// month could steal the sourceCalcMonth tag off a ЗП row that was actually an earlier month's
// remainder (e.g. Лена/Аня's ЗП on the 15th, which is really the PREVIOUS calc period's leftover
// landing in this calendar month — see migrateEmployeeCalc's payMatchNext). That steal breaks
// "Сохранить в график выплат" for the month that actually owns the row (it can no longer find it,
// so it creates a duplicate instead of updating it) — this restores the correct owner.
// Matches by DATE only, not amount: a calc period's stored payAmount is the *computed* total
// (оклад + бонусы − вычеты) and can legitimately differ by a few rubles from the amount actually
// recorded in the schedule row (rounding/manual reconciliation), so requiring an exact amount
// match would silently skip real cases — the date is what both sides always agree on.
// Safe to run on every load: only clears a usurping month's payAmount/payDate when they still
// exactly match the stolen row (proving that month never entered its own value), so it never
// overwrites a real user edit, and it's a no-op once a state is already correct.
function repairStolenPayTags(s){
  s.schedule.forEach(row => {
    if (row.type !== 'ЗП' || PRODUCT_DEPT_RULES[row.emp]) return;
    const rightfulOwner = Object.keys(s.calc).find(month =>
      nextMonthLabel(month) === monthLabelForDate(row.date) &&
      s.calc[month][row.emp] && s.calc[month][row.emp].payDate === row.date
    );
    if (!rightfulOwner || row.sourceCalcMonth === rightfulOwner) return;
    const usurper = row.sourceCalcMonth;
    if (usurper && s.calc[usurper] && s.calc[usurper][row.emp] && s.calc[usurper][row.emp].payDate === row.date){
      s.calc[usurper][row.emp].payAmount = 0;
      s.calc[usurper][row.emp].payDate = null;
    }
    row.sourceCalcMonth = rightfulOwner;
  });
}

function buildInitialState(){
  const schedule = DATA.schedule.map(it => ({...it}));
  const years = {}; DATA.calcMonthOrder.forEach(m => years[m] = 2026);
  const monthStatus = {}; DATA.calcMonthOrder.forEach(m => monthStatus[m] = (m === 'АВГУСТ') ? 'план' : 'факт');

  const calc = {};
  DATA.calcMonthOrder.forEach(month => {
    calc[month] = {};
    Object.keys(DATA.calc[month]).forEach(empId => {
      calc[month][empId] = migrateEmployeeCalc(month, empId, DATA.calc[month][empId], schedule);
    });
  });

  const s = { schedule, calc, years, monthStatus };
  seedMissingMonths(s);
  seedProductDept(s);
  repairStolenPayTags(s);
  return s;
}

/* ================= storage: Supabase (общая база) + localStorage (кэш) ================= */
const DOC_ID = 'zabota';
let remoteVersion = 0;      // версия строки в базе, которую мы видели последней
let lastSavedJson = null;   // stableJson состояния, совпадающего с базой
let saveTimer = null;
let savePending = false;
let pendingRemote = null;   // правка с сервера, отложенная пока пользователь печатает


// jsonb в Postgres переупорядочивает ключи, поэтому сравниваем состояния через стабильную сериализацию
function stableJson(v){
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(stableJson).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + stableJson(v[k])).join(',') + '}';
}
function validState(s){ return !!(s && s.schedule && s.calc && s.years && s.monthStatus); }
function localLoad(){
  try { const s = JSON.parse(localStorage.getItem(STATE_KEY)); if (validState(s)) return s; } catch(e){}
  return null;
}
function localSave(){ try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch(e){} }

function askInitialState(){
  return new Promise(resolve => {
    const ov = document.getElementById('setupOverlay');
    const ta = document.getElementById('setupJson');
    const err = document.getElementById('setupError');
    ov.hidden = false;
    document.getElementById('setupImportBtn').addEventListener('click', () => {
      try {
        const s = JSON.parse(ta.value.trim());
        if (!validState(s)) throw new Error('bad shape');
        ov.hidden = true; resolve(s);
      } catch(e){
        err.textContent = 'Не удалось разобрать данные. В старом дашборде нажмите «Скопировать данные для переноса» и вставьте текст целиком.';
      }
    });
    document.getElementById('setupFreshBtn').addEventListener('click', () => { ov.hidden = true; resolve(buildInitialState()); });
  });
}

async function loadState(){
  if (!sb){
    setSync('local', 'База не настроена — данные только в этом браузере');
    return localLoad() || buildInitialState();
  }
  setSync('busy', 'Загружаю из базы…');
  const { data, error } = await sb.from('payroll_state').select('state,version').eq('id', DOC_ID).maybeSingle();
  if (error){
    console.error('payroll_state load failed', error);
    setSync('error', 'Нет связи с базой — работаю локально, правки в базу не попадут');
    return localLoad() || buildInitialState();
  }
  if (data && validState(data.state)){
    remoteVersion = data.version;
    lastSavedJson = stableJson(data.state);
    setSync('ok', 'Сохранено');
    return data.state;
  }
  // База пустая: первый запуск — переносим данные из старого дашборда или стартуем с исходных
  const s = await askInitialState();
  const ins = await sb.from('payroll_state').upsert({ id: DOC_ID, state: s, version: 1 }).select('version').maybeSingle();
  if (ins.error){
    console.error('payroll_state insert failed', ins.error);
    setSync('error', 'Не удалось записать в базу: ' + ins.error.message);
  } else {
    remoteVersion = ins.data.version; lastSavedJson = stableJson(s); setSync('ok', 'Сохранено');
  }
  return s;
}

function saveState(){
  localSave();
  if (!sb) return;
  if (stableJson(state) === lastSavedJson) return;
  clearTimeout(saveTimer);
  setSync('busy', 'Сохраняю…');
  saveTimer = setTimeout(() => { saveTimer = null; remoteSave(); }, 400);
}
function saveInFlight(){ return !!(saveTimer || savePending); }
async function remoteSave(){
  if (savePending){ saveState(); return; }
  savePending = true;
  try {
    const snap = JSON.parse(JSON.stringify(state));
    const snapJson = stableJson(snap);
    if (snapJson === lastSavedJson){ setSync('ok', 'Сохранено'); return; }
    const next = remoteVersion + 1;
    const { data, error } = await sb.from('payroll_state')
      .update({ state: snap, version: next, updated_at: new Date().toISOString() })
      .eq('id', DOC_ID).eq('version', remoteVersion).select('version');
    if (error){
      console.error('payroll_state save failed', error);
      setSync('error', 'Ошибка сохранения: ' + error.message + ' — повторю через 20 секунд');
      clearTimeout(saveTimer); saveTimer = setTimeout(() => { saveTimer = null; remoteSave(); }, 20000); // правки не теряются: повторяем, пока база не примет
      return;
    }
    if (!data || !data.length){
      // Кто-то сохранил раньше нас (наша версия устарела): берём то, что в базе, свою правку не накладываем
      setSync('error', 'Данные изменил кто-то другой — страница обновлена с сервера, повторите правку');
      remoteVersion = 0; savePending = false;
      await reloadFromRemote(true);
      return;
    }
    remoteVersion = next; lastSavedJson = snapJson; setSync('ok', 'Сохранено');
    if (stableJson(state) !== snapJson) saveState(); // пока сохраняли, что-то изменилось ещё
  } finally { savePending = false; }
}
async function reloadFromRemote(keepStatus){
  const { data, error } = await sb.from('payroll_state').select('state,version').eq('id', DOC_ID).maybeSingle();
  if (error || !data || !validState(data.state)) return;
  applyRemote(data.state, data.version, keepStatus);
}
function isEditing(){ const ae = document.activeElement; return !!(ae && /^(INPUT|SELECT|TEXTAREA)$/.test(ae.tagName)); }
let pendingRemoteTimer = null;
function applyRemote(s, version, keepStatus){
  if (version <= remoteVersion) return;
  // Пока наша правка ещё не ушла в базу, чужую версию не накладываем: наш update увидит
  // устаревшую версию, отклонится, и пользователь получит явное сообщение вместо тихой потери правки
  if (saveInFlight()) return;
  if (stableJson(s) === stableJson(state)){ remoteVersion = version; lastSavedJson = stableJson(s); return; } // наше же эхо
  if (isEditing()){
    // Пользователь сейчас что-то вводит: перерисовать позже, когда уйдёт из поля
    pendingRemote = { s, version };
    if (!pendingRemoteTimer) pendingRemoteTimer = setInterval(() => {
      if (isEditing() || saveInFlight()) return;
      clearInterval(pendingRemoteTimer); pendingRemoteTimer = null;
      const p = pendingRemote; pendingRemote = null;
      if (p) applyRemote(p.s, p.version);
    }, 500);
    return;
  }
  state = s; remoteVersion = version; lastSavedJson = stableJson(s); localSave();
  renderSchedule(); renderHistory(); renderStructure();
  if (!keepStatus) setSync('ok', 'Обновлено с сервера');
}
function startRealtime(){
  if (!sb) return;
  sb.channel('payroll_state_changes')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'payroll_state', filter: `id=eq.${DOC_ID}` },
        payload => { const r = payload.new; if (r && validState(r.state)) applyRemote(r.state, r.version); })
    .subscribe();
}
window.addEventListener('beforeunload', e => {
  if (saveTimer || savePending){ e.preventDefault(); e.returnValue = ''; }
});
// One-time cleanup for rows already duplicated by the upsertSchedule bug fixed above (same
// employee/type/date/amount ending up as two separate rows): keeps one row per key, preferring
// one already marked paid so a paid click on either copy survives. Safe to run on every load —
// once a state has no duplicates left, it's a no-op.
function dedupeSchedule(s){
  const kept = [];
  const indexByKey = new Map();
  s.schedule.forEach(it => {
    const key = `${it.emp}|${it.type}|${it.date}|${it.amount}`;
    const idx = indexByKey.get(key);
    if (idx === undefined){
      indexByKey.set(key, kept.length);
      kept.push(it);
    } else if (it.paid && !kept[idx].paid){
      kept[idx] = it;
    }
  });
  s.schedule = kept;
}
async function bootState(){
state = await loadState();
dedupeSchedule(state);
// One-off: this note referenced a manual отпускные payment that's now tracked as its own separate
// schedule row, so it's stale on the ЗП row itself — clear it for anyone whose saved state still
// carries the old text (idempotent: a no-op once it's already gone).
state.schedule.forEach(it => {
  if (it.emp === 'yana' && it.type === 'ЗП' && it.note === '7 сентября зп+отпускные = 56+21') it.note = null;
});
seedMissingMonths(state);
seedProductDept(state);
repairStolenPayTags(state);
saveState();
}

function ensureYearFor(monthLabel, iso){ if (!state.years[monthLabel]) state.years[monthLabel] = Number(iso.slice(0,4)); }
function monthSortKey(label){ return (state.years[label]||2026) * 12 + RU_MONTHS.indexOf(label); }
function allScheduleMonths(){ return Array.from(new Set(state.schedule.map(it=>it.month))).sort((a,b)=>monthSortKey(a)-monthSortKey(b)); }
function allCalcMonths(){ return Object.keys(state.calc).sort((a,b)=>monthSortKey(a)-monthSortKey(b)); }
function allMonths(){ return RU_MONTHS.slice().sort((a,b)=>monthSortKey(a)-monthSortKey(b)); }
function monthMeta(label){ return { year: state.years[label]||2026, monthIndex0: RU_MONTHS.indexOf(label) }; }

function isPaid(item){ return !!item.paid; }
function togglePaid(id){
  const item = state.schedule.find(x => x.id === id);
  if (!item) return;
  item.paid = !item.paid;
  saveState();
  renderSchedule();
  renderHistory();
}
function updateScheduleField(id, field, value){
  const item = state.schedule.find(x => x.id === id);
  if (!item) return;
  item[field] = value;
  if (field === 'date'){ item.month = monthLabelForDate(value); ensureYearFor(item.month, value); }
  saveState();
  renderSchedule();
  renderHistory();
}
function deleteSchedule(id){
  if (!confirm('Удалить эту выплату из графика?')) return;
  state.schedule = state.schedule.filter(x => x.id !== id);
  saveState();
  renderSchedule();
  renderHistory();
}
function addSchedule(entry){
  entry.id = genId('s');
  entry.month = monthLabelForDate(entry.date);
  entry.paid = false;
  ensureYearFor(entry.month, entry.date);
  state.schedule.push(entry);
  saveState();
  renderSchedule();
  renderHistory();
}
// calcMonth here is the calc PERIOD (e.g. "АВГУСТ"), not necessarily the calendar month the
// payment itself falls on — those two differ for most Аванс/ЗП rows in this tool (remainders and
// some Аванс rows land in the following calendar month). Matching by sourceCalcMonth instead of
// the payment's own calendar month is what makes repeated clicks update the same row instead of
// creating a new duplicate every time.
function upsertSchedule(empId, calcMonth, type, date, amount){
  if (!date) return;
  let entry = state.schedule.find(it => it.emp === empId && it.type === type && it.sourceCalcMonth === calcMonth);
  if (!entry){
    // Fall back to an untagged row landing on the same calendar month as the new date — covers
    // rows that predate sourceCalcMonth tagging (e.g. the original seed data), so this adopts
    // and tags that row instead of duplicating it.
    const targetMonth = monthLabelForDate(date);
    entry = state.schedule.find(it => it.emp === empId && it.type === type && !it.sourceCalcMonth && it.month === targetMonth);
  }
  if (!entry){ entry = {id:genId('sync'), emp:empId, type, paid:false, note:null, sourceCalcMonth:calcMonth}; state.schedule.push(entry); }
  entry.sourceCalcMonth = calcMonth;
  entry.date = date;
  entry.amount = amount;
  entry.month = monthLabelForDate(date);
  ensureYearFor(entry.month, date);
}
function syncCalcToSchedule(month, empId){
  const c = state.calc[month][empId];
  upsertSchedule(empId, month, 'Аванс', c.avansDate, c.avansAmount);
  upsertSchedule(empId, month, 'ЗП', c.payDate, c.payAmount);
  saveState();
  renderSchedule();
  renderHistory();
}
function computeEmployeeTotal(month, empId){
  const c = (state.calc[month]||{})[empId];
  if (!c) return 0;
  let sum = 0;
  c.rows.forEach(r => {
    if (!r.include) return;
    const v = r.value || 0;
    sum += r.label.indexOf('Вычет') === 0 ? -v : v;
  });
  return round2(sum);
}

/* ================= tab navigation ================= */
document.getElementById('tabNav').addEventListener('click', e => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  document.querySelectorAll('#tabNav .tab-btn').forEach(b => b.classList.toggle('active', b === btn));
  document.querySelectorAll('.payroll-root .tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + btn.dataset.tab));
});

/* ================= SCHEDULE TAB ================= */
// Defaults to the real calendar month (all 12 months are pre-seeded, so it's always present)
// rather than "Все", so opening the tab lands on "now"; the month selector in the toolbar lets you
// switch to any other month or back to "Все".
let scheduleFilters = { month: todayMonthLabel(), role: 'all' };
let scheduleView = 'list';
const WEEKDAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

document.getElementById('scheduleView').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  scheduleView = btn.dataset.view;
  document.querySelectorAll('#scheduleView button').forEach(b => b.classList.toggle('active', b === btn));
  renderSchedule();
});

function buildCalendarCells(year, monthIndex0){
  const firstDay = new Date(year, monthIndex0, 1);
  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();
  let startWeekday = (firstDay.getDay() + 6) % 7; // Monday = 0
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function renderScheduleFilters(){
  const monthSel = document.getElementById('monthFilter');
  const monthOpts = [['all','Все']].concat(allMonths().map(m => [m, m.charAt(0)+m.slice(1).toLowerCase()]));
  monthSel.innerHTML = monthOpts.map(([val,label]) =>
    `<option value="${val}"${scheduleFilters.month === val ? ' selected' : ''}>${label}</option>`
  ).join('');
  monthSel.onchange = () => { scheduleFilters.month = monthSel.value; renderSchedule(); };

  const roleWrap = document.getElementById('roleFilter');
  roleWrap.innerHTML = '';
  [['all','Все']].concat(ROLES.map(r=>[r,r])).forEach(([val,label]) => {
    const b = document.createElement('button');
    b.className = 'chip' + (scheduleFilters.role === val ? ' active' : '');
    b.textContent = label;
    b.onclick = () => { scheduleFilters.role = val; renderSchedule(); };
    roleWrap.appendChild(b);
  });
}

function filteredSchedule(){
  return state.schedule.filter(item => {
    if (scheduleFilters.month !== 'all' && item.month !== scheduleFilters.month) return false;
    if (scheduleFilters.role !== 'all' && empById(item.emp).role !== scheduleFilters.role) return false;
    return true;
  });
}

function renderStatTiles(items){
  const wrap = document.getElementById('statTiles');
  const today = todayMidnight();
  let total = 0, paidSum = 0, overdueSum = 0, overdueCount = 0;
  items.forEach(it => {
    total += it.amount;
    if (isPaid(it)) paidSum += it.amount;
    else if (parseISO(it.date) < today){ overdueSum += it.amount; overdueCount++; }
  });
  const remaining = total - paidSum;
  const pct = total > 0 ? Math.round(paidSum/total*100) : 0;
  const tiles = [
    {label:'Всего в выборке', value: fmtMoney(total), sub: items.length + ' выплат'},
    {label:'Выплачено', value: fmtMoney(paidSum), sub: pct + '% от суммы', cls:'ok'},
    {label:'Осталось выплатить', value: fmtMoney(remaining), sub: (items.length - items.filter(isPaid).length) + ' выплат'},
    {label:'Просрочено', value: overdueCount ? fmtMoney(overdueSum) : '—', sub: overdueCount ? overdueCount + ' выплат(а)' : 'всё в срок', cls: overdueCount ? 'warn' : ''},
  ];
  wrap.innerHTML = tiles.map(t => `
    <div class="stat-tile ${t.cls||''}">
      <div class="stat-label">${t.label}</div>
      <div class="stat-value">${t.value}</div>
      <div class="stat-sub">${t.sub}</div>
    </div>`).join('');
}

function paymentStatus(it, today){
  const paid = isPaid(it);
  const overdue = !paid && parseISO(it.date) < today;
  const diffDays = Math.round((parseISO(it.date) - today) / 86400000);
  const soon = !paid && !overdue && diffDays <= 3 && diffDays >= 0;
  return { paid, overdue, soon };
}

function renderCalendarMonth(month, items){
  const meta = monthMeta(month);
  const today = todayMidnight();
  const cells = buildCalendarCells(meta.year, meta.monthIndex0);
  const monthItems = items.filter(it => it.month === month);
  const monthTotal = monthItems.reduce((s,it) => s + it.amount, 0);
  const paidCount = monthItems.filter(isPaid).length;
  const pct = monthItems.length ? Math.round(paidCount/monthItems.length*100) : 0;
  const byDay = {};
  monthItems.forEach(it => {
    const day = Number(it.date.slice(8,10));
    (byDay[day] = byDay[day] || []).push(it);
  });

  const headHtml = WEEKDAYS.map(w => `<div class="cal-weekday">${w}</div>`).join('');
  const cellsHtml = cells.map(day => {
    if (day === null) return '<div class="cal-cell empty"></div>';
    const dateObj = new Date(meta.year, meta.monthIndex0, day);
    const isToday = dateObj.getTime() === today.getTime();
    const dow = dateObj.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const dayItems = (byDay[day] || []).sort((a,b) => empById(a.emp).full.localeCompare(empById(b.emp).full));
    const dayTotal = dayItems.reduce((s,it) => s + it.amount, 0);
    const pmtsHtml = dayItems.map(it => {
      const emp = empById(it.emp);
      const st = paymentStatus(it, today);
      const cls = st.paid ? 'is-paid' : (st.overdue ? 'is-overdue' : (st.soon ? 'is-soon' : ''));
      return `<button class="cal-pmt ${it.type==='ЗП'?'zp':'avans'} ${cls}" data-id="${it.id}" title="${emp.full} · ${it.type} · ${fmtMoney(it.amount)} · ${st.paid?'выплачено':(st.overdue?'просрочено':'ожидает')}">
        <span class="cal-pmt-name">${emp.short}</span><span class="cal-pmt-amt">${fmtMoneyCompact(it.amount)}</span>
      </button>`;
    }).join('');
    const dayTotalHtml = dayItems.length > 1
      ? `<div class="cal-day-total">Итого ${fmtMoneyCompact(dayTotal)}</div>` : '';
    return `<div class="cal-cell ${isToday?'today':''} ${isWeekend?'weekend':''}">
      <div class="cal-daynum">${day}</div>
      <div class="cal-pmts">${pmtsHtml}</div>
      ${dayTotalHtml}
    </div>`;
  }).join('');

  return `
    <div class="calendar-block">
      <div class="cal-month-head">
        <h2 class="cal-month-title">${month.charAt(0)+month.slice(1).toLowerCase()} ${meta.year}</h2>
        <div class="ledger-month-meta">
          <span>${fmtMoney(monthTotal)}</span>
          <span>${paidCount}/${monthItems.length} выплачено</span>
          <div class="progress"><span style="width:${pct}%"></span></div>
        </div>
      </div>
      <div class="cal-scroll">
        <div class="cal-grid">${headHtml}${cellsHtml}</div>
      </div>
    </div>`;
}

function renderCalendarViews(items, monthsPresent){
  const legend = `
    <div class="cal-legend">
      <div class="item"><span class="swatch zp"></span>ЗП</div>
      <div class="item"><span class="swatch avans"></span>Аванс</div>
      <div class="item"><span class="swatch paid"></span>Выплачено</div>
      <div class="item"><span class="swatch soon"></span>Скоро (≤3 дней)</div>
      <div class="item"><span class="swatch overdue"></span>Просрочено</div>
    </div>`;
  return legend + monthsPresent.map(month => renderCalendarMonth(month, items)).join('');
}

function renderSchedule(){
  renderScheduleFilters();
  const items = filteredSchedule();
  renderStatTiles(items);
  const today = todayMidnight();
  const ledger = document.getElementById('scheduleLedger');

  const monthsPresent = allScheduleMonths().filter(m => items.some(it => it.month === m));
  if (!monthsPresent.length){
    ledger.innerHTML = '<div class="empty-state">Нет выплат по выбранным фильтрам</div>';
    return;
  }

  if (scheduleView === 'calendar'){
    ledger.innerHTML = renderCalendarViews(items, monthsPresent);
    return;
  }

  ledger.innerHTML = monthsPresent.map(month => {
    const rows = items.filter(it => it.month === month).sort((a,b) => a.date.localeCompare(b.date) || empById(a.emp).full.localeCompare(empById(b.emp).full));
    const monthTotal = rows.reduce((s,r) => s + r.amount, 0);
    const paidCount = rows.filter(isPaid).length;
    const pct = rows.length ? Math.round(paidCount/rows.length*100) : 0;

    const rowsHtml = rows.map(it => {
      const emp = empById(it.emp);
      const st = paymentStatus(it, today);
      const rowClass = st.paid ? 'paid' : (st.overdue ? 'overdue' : (st.soon ? 'soon' : ''));
      const statusClass = st.paid ? 'is-paid' : (st.overdue ? 'is-overdue' : (st.soon ? 'is-soon' : ''));
      const statusText = st.paid ? 'Выплачено' : (st.overdue ? 'Просрочено' : (st.soon ? 'Скоро' : 'Ожидает'));
      const typeCls = it.type === 'ЗП' ? 'zp' : (it.type === 'Аванс' ? 'avans' : 'other');
      return `
        <div class="ledger-row ${rowClass}">
          <div class="col date"><input type="date" class="ledger-input ledger-date" data-id="${it.id}" value="${it.date}"></div>
          <div class="col emp"><span class="name">${emp.full}</span><span class="role-badge">${roleLabel(emp)}</span></div>
          <div class="col type"><span class="type-pill ${typeCls}">${it.type}</span></div>
          <div class="col amount"><input type="number" step="any" class="ledger-input ledger-amount" data-id="${it.id}" value="${it.amount}"></div>
          <div class="col status">
            <button class="status-pill ${statusClass}" data-id="${it.id}"><span class="dot"></span>${statusText}</button>
          </div>
          <div class="col del"><button class="icon-btn" data-del="${it.id}" title="Удалить выплату">×</button></div>
        </div>
        ${it.note ? `<div class="row-note">${it.note}</div>` : ''}
      `;
    }).join('');

    return `
      <div class="ledger-month">
        <div class="ledger-month-head">
          <h2>${month.charAt(0) + month.slice(1).toLowerCase()}</h2>
          <div class="ledger-month-meta">
            <span>${fmtMoney(monthTotal)}</span>
            <span>${paidCount}/${rows.length} выплачено</span>
            <div class="progress"><span style="width:${pct}%"></span></div>
          </div>
        </div>
        <div class="table-scroll">
          <div class="ledger-grid">
            <div class="ledger-row head">
              <div>Дата</div><div>Сотрудник</div><div>Тип</div><div style="text-align:right;">Сумма</div><div>Статус</div><div></div>
            </div>
            ${rowsHtml}
          </div>
        </div>
      </div>`;
  }).join('');
}

// delegated, bound once — inputs stay editable without full-ledger re-render churn on every click
const scheduleLedgerEl = document.getElementById('scheduleLedger');
scheduleLedgerEl.addEventListener('click', e => {
  const statusBtn = e.target.closest('.status-pill');
  if (statusBtn){ togglePaid(statusBtn.dataset.id); return; }
  const calBtn = e.target.closest('.cal-pmt');
  if (calBtn){ togglePaid(calBtn.dataset.id); return; }
  const delBtn = e.target.closest('[data-del]');
  if (delBtn){ deleteSchedule(delBtn.dataset.del); }
});
scheduleLedgerEl.addEventListener('change', e => {
  const t = e.target;
  if (t.classList.contains('ledger-date')) updateScheduleField(t.dataset.id, 'date', t.value);
  else if (t.classList.contains('ledger-amount')) updateScheduleField(t.dataset.id, 'amount', parseFloat(t.value) || 0);
});

function populateEmpSelect(sel){
  sel.innerHTML = DATA.employees.map(e => `<option value="${e.id}">${e.full}</option>`).join('');
}
populateEmpSelect(document.getElementById('apEmp'));
document.getElementById('apAddBtn').addEventListener('click', () => {
  const emp = document.getElementById('apEmp').value;
  const date = document.getElementById('apDate').value;
  const amount = parseFloat(document.getElementById('apAmount').value);
  const type = document.getElementById('apType').value;
  const note = document.getElementById('apNote').value.trim();
  if (!date || !amount){ alert('Укажите дату и сумму выплаты.'); return; }
  addSchedule({emp, date, amount, type, note: note || null});
  document.getElementById('apAmount').value = '';
  document.getElementById('apNote').value = '';
});

/* ================= HISTORY TAB ================= */
let historyState = { scope: 'team', sub: null };

function historyEmployeesWithData(){
  const ids = new Set(state.schedule.map(it => it.emp));
  return DATA.employees.filter(e => ids.has(e.id));
}

document.getElementById('historyScope').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  historyState.scope = btn.dataset.scope;
  historyState.sub = null;
  document.querySelectorAll('#historyScope button').forEach(b => b.classList.toggle('active', b === btn));
  renderHistory();
});

function renderHistorySub(){
  const wrap = document.getElementById('historySubWrap');
  const chipWrap = document.getElementById('historySub');
  chipWrap.innerHTML = '';
  if (historyState.scope === 'employee'){
    wrap.style.display = '';
    const emps = historyEmployeesWithData();
    if (!historyState.sub) historyState.sub = emps[0].id;
    emps.forEach(e => {
      const b = document.createElement('button');
      b.className = 'chip' + (historyState.sub === e.id ? ' active' : '');
      b.textContent = e.short;
      b.onclick = () => { historyState.sub = e.id; renderHistory(); };
      chipWrap.appendChild(b);
    });
  } else {
    wrap.style.display = 'none';
  }
}

function computeHistorySeries(){
  let segmentDefs;
  if (historyState.scope === 'employee'){
    segmentDefs = [{key:'Аванс', label:'Аванс', color:WARN_COLOR}, {key:'ЗП', label:'ЗП', color:ACCENT_COLOR}];
  } else if (historyState.scope === 'role'){
    segmentDefs = ROLES.filter(r => historyEmployeesWithData().some(e => e.role === r))
      .map(r => ({key:r, label:r, color:ROLE_COLORS[r] || '#888'}));
  } else {
    segmentDefs = historyEmployeesWithData().map(e => ({key:e.id, label:e.short, color:EMP_COLORS[e.id] || '#888'}));
  }

  const months = allScheduleMonths();
  const rows = months.map(month => {
    const monthItems = state.schedule.filter(it => it.month === month);
    const segValues = {};
    let total = 0, paidCount = 0, count = 0;
    segmentDefs.forEach(seg => {
      let items;
      if (historyState.scope === 'employee'){
        items = monthItems.filter(it => it.emp === historyState.sub && it.type === seg.key);
      } else if (historyState.scope === 'role'){
        items = monthItems.filter(it => empById(it.emp).role === seg.key);
      } else {
        items = monthItems.filter(it => it.emp === seg.key);
      }
      const sum = items.reduce((s,it) => s + it.amount, 0);
      segValues[seg.key] = sum;
      total += sum;
      count += items.length;
      paidCount += items.filter(isPaid).length;
    });
    return { month, segValues, total, paidCount, count };
  }).filter(r => r.total > 0 || r.count > 0);

  return { segmentDefs, rows };
}

function renderHistoryChart(segmentDefs, rows){
  const svg = document.getElementById('historyChart');
  const W = 640, H = 300, padL = 54, padR = 16, padT = 18, padB = 34;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const maxTotal = Math.max(1, ...rows.map(r => r.total));
  const niceMax = Math.ceil(maxTotal / 50000) * 50000 || maxTotal;

  let gridSvg = '';
  const gridLines = 4;
  for (let i = 0; i <= gridLines; i++){
    const y = padT + plotH - (plotH * i / gridLines);
    const val = niceMax * i / gridLines;
    gridSvg += `<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="var(--line)" stroke-width="1"></line>`;
    gridSvg += `<text x="${padL-8}" y="${y+4}" text-anchor="end" font-family="var(--font-mono)" font-size="10" fill="var(--ink-faint)">${fmtMoneyShort(val)}</text>`;
  }

  const bandW = plotW / rows.length;
  const barW = Math.min(64, bandW * 0.5);
  let barsSvg = '';
  rows.forEach((row, i) => {
    const cx = padL + bandW * i + bandW/2;
    let y = padT + plotH;
    segmentDefs.forEach(seg => {
      const v = row.segValues[seg.key] || 0;
      if (v <= 0) return;
      const h = (v / niceMax) * plotH;
      y -= h;
      barsSvg += `<rect class="bar-seg" x="${(cx-barW/2).toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" fill="${seg.color}" rx="2"><title>${seg.label}: ${fmtMoney(v)}</title></rect>`;
    });
    barsSvg += `<text x="${cx}" y="${(padT+plotH-((row.total/niceMax)*plotH)-8).toFixed(1)}" text-anchor="middle" font-family="var(--font-mono)" font-size="11" font-weight="600" fill="var(--ink)">${fmtMoneyShort(row.total)}</text>`;
    barsSvg += `<text x="${cx}" y="${H-10}" text-anchor="middle" font-family="var(--font-body)" font-size="12" font-weight="600" fill="var(--ink-soft)">${MONTH_SHORT[row.month] || row.month}</text>`;
  });

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = gridSvg + barsSvg;

  document.getElementById('historyLegend').innerHTML = segmentDefs.map(s =>
    `<div class="item"><span class="swatch" style="background:${s.color}"></span>${s.label}</div>`
  ).join('');
}

function renderHistoryTable(segmentDefs, rows){
  const table = document.getElementById('historyTable');
  const head = `<thead><tr><th>Месяц</th>${segmentDefs.map(s=>`<th>${s.label}</th>`).join('')}<th>Итого</th><th>Статус</th></tr></thead>`;
  const body = rows.map(r => {
    const cells = segmentDefs.map(s => `<td>${fmtMoney(r.segValues[s.key]||0)}</td>`).join('');
    let badge;
    if (r.count === 0) badge = `<span class="paid-badge none">нет данных</span>`;
    else if (r.paidCount === r.count) badge = `<span class="paid-badge full">выплачено</span>`;
    else if (r.paidCount === 0) badge = `<span class="paid-badge none">ожидает</span>`;
    else badge = `<span class="paid-badge partial">${r.paidCount}/${r.count}</span>`;
    return `<tr><td>${r.month.charAt(0)+r.month.slice(1).toLowerCase()}</td>${cells}<td><b>${fmtMoney(r.total)}</b></td><td style="text-align:left;">${badge}</td></tr>`;
  }).join('');
  const totals = segmentDefs.map(s => fmtMoney(rows.reduce((sum,r)=>sum+(r.segValues[s.key]||0),0)));
  const grand = rows.reduce((sum,r)=>sum+r.total,0);
  const foot = `<tfoot><tr><td>Всего</td>${totals.map(t=>`<td>${t}</td>`).join('')}<td>${fmtMoney(grand)}</td><td></td></tr></tfoot>`;
  table.innerHTML = head + '<tbody>' + body + '</tbody>' + foot;
}

function renderHistory(){
  renderHistorySub();
  const { segmentDefs, rows } = computeHistorySeries();
  if (!rows.length){
    document.getElementById('historyChart').innerHTML = '';
    document.getElementById('historyLegend').innerHTML = '';
    document.getElementById('historyTable').innerHTML = '<tbody><tr><td class="empty-state">Нет данных для отображения</td></tr></tbody>';
    return;
  }
  renderHistoryChart(segmentDefs, rows);
  renderHistoryTable(segmentDefs, rows);
}

/* ================= STRUCTURE TAB ================= */
let calcMonth = null;
let structureRoleFilter = 'all';

function renderCalcMonthFilter(){
  const sel = document.getElementById('calcMonthFilter');
  sel.innerHTML = allMonths().map(m =>
    `<option value="${m}"${calcMonth === m ? ' selected' : ''}>${m.charAt(0) + m.slice(1).toLowerCase()}</option>`
  ).join('');
  sel.onchange = () => { calcMonth = sel.value; renderStructure(); };
}
function renderStructureRoleFilter(){
  const wrap = document.getElementById('structureRoleFilter');
  wrap.innerHTML = '';
  [['all','Все']].concat(ROLES.map(r=>[r,r])).forEach(([val,label]) => {
    const b = document.createElement('button');
    b.className = 'chip' + (structureRoleFilter === val ? ' active' : '');
    b.textContent = label;
    b.onclick = () => { structureRoleFilter = val; renderStructure(); };
    wrap.appendChild(b);
  });
}
function renderMonthStatusToggle(){
  const btn = document.getElementById('monthStatusToggle');
  const status = state.monthStatus[calcMonth] || 'план';
  btn.textContent = status === 'факт' ? 'Статус месяца: Факт ✓' : 'Статус месяца: План (черновик)';
  btn.className = 'status-toggle ' + (status === 'факт' ? 'is-fact' : 'is-plan');
  btn.onclick = () => {
    state.monthStatus[calcMonth] = (state.monthStatus[calcMonth] === 'факт') ? 'план' : 'факт';
    saveState();
    renderMonthStatusToggle();
  };
}

function renderDeptTotal(){
  const wrap = document.getElementById('deptTotalCard');
  const monthCalc = state.calc[calcMonth] || {};
  const empIds = Object.keys(monthCalc);
  if (!empIds.length){ wrap.innerHTML = '<div class="empty-state">Нет данных за этот месяц — заполните показатели ниже</div>'; return; }
  let total = 0, avans = 0, pay = 0;
  empIds.forEach(id => {
    total += computeEmployeeTotal(calcMonth, id);
    avans += monthCalc[id].avansAmount || 0;
    pay += monthCalc[id].payAmount || 0;
  });
  wrap.innerHTML = `
    <div>
      <div class="big-label">Итого по отделу — ${calcMonth.charAt(0)+calcMonth.slice(1).toLowerCase()}</div>
      <div class="big-value">${fmtMoney(round2(total))}</div>
    </div>
    <div class="chip-list">
      <div class="mini-chip"><b>Аванс</b>${fmtMoney(round2(avans))}</div>
      <div class="mini-chip"><b>Остаток / ЗП</b>${fmtMoney(round2(pay))}</div>
    </div>`;
}

// Employees driven by PRODUCT_DEPT_RULES (fixed oклад/бонус/процент, no "справочно" reference
// rows) get the compact single-block layout: total up top, all editable fields — rows AND
// Аванс/ЗП — together in one place below it, so the whole month can be filled in one pass.
// Everyone else (the sales/activations spreadsheet employees) keeps the rows-above-total layout,
// since their long "справочно" row lists read better as their own list.
function renderCalcCard(emp){
  const c = (state.calc[calcMonth]||{})[emp.id];
  if (!c) return '';
  const total = computeEmployeeTotal(calcMonth, emp.id);
  const isSimple = !!PRODUCT_DEPT_RULES[emp.id];
  const linesHtml = c.rows.map((r,i) => `
    <div class="calc-line-edit">
      <span class="l">${r.label}${r.include ? '' : '<span class="ref-tag">справочно</span>'}</span>
      <span class="edit-field">
        <input type="number" step="any" class="calc-input formula-value" data-emp="${emp.id}" data-idx="${i}" value="${r.value}">
        <span class="unit">${rowUnit(r.label)}</span>
      </span>
    </div>`).join('');

  const payoutRowsHtml = `
        <div class="payout-row">
          <label>Аванс</label>
          <input type="number" step="any" class="calc-input payout-field" data-emp="${emp.id}" data-field="avansAmount" value="${c.avansAmount}">
          <input type="date" class="calc-date payout-field" data-emp="${emp.id}" data-field="avansDate" value="${c.avansDate||''}">
        </div>
        <div class="payout-row">
          <label>ЗП</label>
          <input type="number" step="any" class="calc-input payout-field" data-emp="${emp.id}" data-field="payAmount" value="${c.payAmount}">
          <input type="date" class="calc-date payout-field" data-emp="${emp.id}" data-field="payDate" value="${c.payDate||''}">
          <button class="mini-btn apply-computed" data-emp="${emp.id}" title="Подставить: Итого − Аванс">= Итого−Аванс</button>
        </div>
        <div class="payout-actions">
          <button class="sync-btn" data-emp="${emp.id}">Сохранить в график выплат</button>
          <span class="sync-status" data-sync-status="${emp.id}"></span>
        </div>`;

  if (isSimple){
    return `
      <article class="calc-card">
        <header>
          <h3>${emp.full}</h3>
          <span class="role-badge">${roleLabel(emp)}</span>
        </header>
        <div class="calc-total-live calc-total-top">
          <span class="l">Итого</span>
          <span class="v" data-total-for="${emp.id}">${fmtMoney(total)}</span>
        </div>
        <div class="payout-editor">
          <div class="calc-lines">${linesHtml}</div>
          ${payoutRowsHtml}
        </div>
      </article>
    `;
  }

  return `
    <article class="calc-card">
      <header>
        <h3>${emp.full}</h3>
        <span class="role-badge">${roleLabel(emp)}</span>
      </header>
      <div class="calc-lines">${linesHtml}</div>
      <div class="calc-total-live">
        <span class="l">Итого по показателям</span>
        <span class="v" data-total-for="${emp.id}">${fmtMoney(total)}</span>
      </div>
      <div class="payout-editor">
        ${payoutRowsHtml}
      </div>
    </article>
  `;
}

function domComputeTotal(card, empId){
  let sum = 0;
  card.querySelectorAll('.formula-value').forEach(inp => {
    const idx = Number(inp.dataset.idx);
    const row = state.calc[calcMonth][empId].rows[idx];
    const v = parseFloat(inp.value) || 0;
    if (row.include) sum += row.label.indexOf('Вычет') === 0 ? -v : v;
  });
  return round2(sum);
}

const calcGroupsEl = document.getElementById('calcGroups');
calcGroupsEl.addEventListener('input', e => {
  const t = e.target;
  if (!t.classList.contains('formula-value')) return;
  const empId = t.dataset.emp;
  const card = t.closest('.calc-card');
  const totalEl = card.querySelector(`[data-total-for="${empId}"]`);
  if (totalEl) totalEl.textContent = fmtMoney(domComputeTotal(card, empId));
});
calcGroupsEl.addEventListener('change', e => {
  const t = e.target;
  const empId = t.dataset.emp;
  if (!empId || !state.calc[calcMonth] || !state.calc[calcMonth][empId]) return;
  const c = state.calc[calcMonth][empId];
  if (t.classList.contains('formula-value')){
    c.rows[Number(t.dataset.idx)].value = parseFloat(t.value) || 0;
    saveState();
    renderDeptTotal();
  } else if (t.classList.contains('payout-field')){
    const field = t.dataset.field;
    c[field] = field.endsWith('Date') ? (t.value || null) : (parseFloat(t.value) || 0);
    saveState();
    renderDeptTotal();
  }
});
calcGroupsEl.addEventListener('click', e => {
  const applyBtn = e.target.closest('.apply-computed');
  if (applyBtn){
    const empId = applyBtn.dataset.emp;
    const card = applyBtn.closest('.calc-card');
    const avansInput = card.querySelector('.payout-field[data-field="avansAmount"]');
    const payInput = card.querySelector('.payout-field[data-field="payAmount"]');
    const avansVal = parseFloat(avansInput.value) || 0;
    const total = domComputeTotal(card, empId);
    const newPay = round2(total - avansVal);
    payInput.value = newPay;
    const c = state.calc[calcMonth][empId];
    c.avansAmount = avansVal;
    c.payAmount = newPay;
    saveState();
    renderDeptTotal();
    return;
  }
  const syncBtn = e.target.closest('.sync-btn');
  if (syncBtn){
    const empId = syncBtn.dataset.emp;
    syncCalcToSchedule(calcMonth, empId);
    const statusEl = document.querySelector(`[data-sync-status="${empId}"]`);
    if (statusEl){
      statusEl.textContent = '✓ сохранено в график';
      setTimeout(() => { if (statusEl) statusEl.textContent = ''; }, 2500);
    }
  }
});

// Default to the real calendar month when it's available (it always is, now that all 12 months
// are pre-seeded) so opening the tab lands on "now" rather than on December just because it sorts
// last; falls back to the dataset's month, then to the most recent one.
function defaultCalcMonth(){
  const months = allCalcMonths();
  if (!months.length) return null;
  const now = todayMonthLabel();
  if (months.includes(now)) return now;
  return months.includes(CURRENT_MONTH) ? CURRENT_MONTH : months[months.length-1];
}

function renderStructure(){
  if (!calcMonth || !state.calc[calcMonth]) calcMonth = defaultCalcMonth();
  renderCalcMonthFilter();
  renderMonthStatusToggle();
  renderStructureRoleFilter();
  renderDeptTotal();
  const monthCalc = state.calc[calcMonth] || {};
  const visibleRoles = structureRoleFilter === 'all' ? ROLES : ROLES.filter(r => r === structureRoleFilter);
  const groups = visibleRoles.map(role => {
    const emps = DATA.employees.filter(e => e.role === role && monthCalc[e.id]);
    if (!emps.length) return '';
    return `<div class="role-section"><h2>${role}</h2><div class="calc-grid">${emps.map(renderCalcCard).join('')}</div></div>`;
  }).join('');
  calcGroupsEl.innerHTML = groups || '<div class="empty-state">Нет сотрудников с расчётом за этот месяц</div>';
}

/* ================= init ================= */
let booted = false;
export async function initPayroll(){
  if (booted) return;
  booted = true;
  await bootState();
  renderSchedule();
  renderHistory();
  renderStructure();
  startRealtime();
}
