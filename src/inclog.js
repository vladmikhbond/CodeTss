//////////////////////////////////////////////////////////////////////////////////
// Переходная версия модуля inclog:
//    внутри функции separate_log() есть конвертор из старогого стиля лога в новый.
// Поэтому работа с готовым логом должна начинаться с вызова separate_log()
// Версия актуальна, пока в бд есть логи обоих стилей
//////////////////////////////////////////////////////////////////////////////////

// Находит наибольшую общую подстроку двух строк.
// Возвращает тройку: [начало в str1, начало в str2, длина]
//
function getLongestCommonSubstring(str1, str2) {
    const m = str1.length + 1;
    const n = str2.length + 1;
    const mn = new Array(m);
    for (let i = 0; i < mn.length; i++)
        mn[i] = new Array(n);

    let max = 0;
    let endIndex = 0;
    let endIndex2 = 0;

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (i == 0 || j == 0)
                mn[i][j] = 0;
            else if (str1[i - 1] === str2[j - 1]) {
                mn[i][j] = mn[i - 1][j - 1] + 1;
                if (max < mn[i][j]) {
                    max = mn[i][j];
                    endIndex = i;
                    endIndex2 = j;
                }
            }
            else
                mn[i][j] = 0;
        }
    }
    return [endIndex - max, endIndex2 - max, max]
}

// Находит все изменения строки a по отношению к строке b.
// d - минимальная длина неизменной части.
// Формат изменений ::= [] | [a, b] | [начало_в_строке_a, длина, измененеия_слева, изменения_справа]
//
function changes(a, b, d = 1) {
    if (a === b)
        return [];  // нет изменений
    let [start1, start2, len] = getLongestCommonSubstring(a, b);
    // общей части нет
    if (len < d) {
        return [a, b]; // полная замена
    }
    // общaя часть есть
    let a1 = a.slice(0, start1);
    let a2 = a.slice(start1 + len);
    let b1 = b.slice(0, start2);
    let b2 = b.slice(start2 + len);
    return [start1, len, changes(a1, b1, d), changes(a2, b2, d)];
}

// Восстанавливает текст по прототипу (t1) и изменениям (changes)
//
function restore(a, changes) {
    // empty change list => t2 = t1
    if (changes.length === 0)
        return a;
    if (changes.length === 2)
        return changes[1];

    let [start1, len, left, right] = changes;
    let a1 = a.slice(0, start1);
    let a2 = a.slice(start1 + len);

    return restore(a1, left) + a.substr(start1, len) + restore(a2, right);
}

// Подсчет активности на одном элементе лога
// возвращает число удаленных и число вставленных символов
//
function activity(changes) {
    let a = activity_rec(changes);
    return { add: a[1], del: a[0] };
}

function activity_rec(changes) {
    if (changes.length === 0)
        return [0, 0];
    if (changes.length === 2)
        return [changes[0].length, changes[1].length];

    let [start1, len, left, right] = changes;
    let l = activity_rec(left);
    let r = activity_rec(right);
    return [l[0] + r[0], l[1] + r[1]];
}

function separate_log(loaded_log, separator) {
    ///////////////////////////////////
    loaded_log = safe_convert(loaded_log);
    ///////////////////////////////////

    const log = [];
    const states = [];
    let frame = "";
    let frame0 = "";
    const frames = [];
    for (let i = 0; i < loaded_log.length; i++) {
        // разборка
        frame = restore(frame, loaded_log[i]);
        let ss = frame.split(separator);
        frames.push(ss[0]);
        let state = ss.length > 1 ? ss[1] : "";
        states.push(state);
        // сборка
        log.push(changes(frame0, ss[0]));
        frame0 = ss[0]
    }
    return { log, states, frames };
}

module.exports = {
   common: getLongestCommonSubstring,
   changes,
   restore,
   activity,
   separate_log
};

///////////////////////////////////////////////////////////////
// Безопасная конверсия лога старого стиля в рекурсивный стиль
// актуалана, пока в базе есть логи старого слиля
///////////////////////////////////////////////////////////////

function safe_convert(old_log)
{
    if (isNewStyle() )
        return old_log;

    const new_log = [];
    for (let i = 0, frame = ""; i < old_log.length; i++) {
        // разборка
        const frame1 = old_restore(frame, old_log[i]);
        // сборка
        const ch = changes(frame, frame1, 1);
        new_log.push(ch);
        frame = frame1;
    }
    return new_log;

    function isNewStyle() {
        for (let arr of old_log)
            if ([0, 2, 4].indexOf(arr.length) === -1)
                return false;
        return true;
    }

    function old_restore(t1, changes) {
        // empty change list => t2 = t1
        if (changes.length === 0)
            return t1;
        let t2 = "";
        for (let i = 0; i < changes.length; i += 3) {
            // n - number of chars to kill,
            // t - inserted text,
            // m - number of chars to live
            let [n, t, m] = [changes[i], changes[i + 1], changes[i + 2]];
            t2 += t;                 // new part
            t2 += t1.slice(n, n + m);  // stable part
            t1 = t1.slice(n + m);      // cut t1
        }
        return t2;
    }

}
