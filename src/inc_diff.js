/* eslint-disable no-undef */

// ---------------------- incremental model ---------------------------

// Находит все изменения строки t2 по отношению к строке t1.
// d - минимальная длина неизменной части.
// Каждое изменение - это тройка: n, t, m, где 
//  n - число удаленных символов
//  t - вставленная строка
//  m - число сохраненных символов
// Возвращает список, длина которого кратна 3. Пустой список означает отсутствие изменений.
function changes(t1, t2, d=1) {
    if (t1 === t2)
        return [];

    let res = []
    while (t1 !== "" || t2 !== "") {
        [i1, i2, w] = one_change(t1, t2, d)
        res.push(i1);
        res.push(t2.slice(0, i2));
        res.push(w);

        // res.push([i1, t2.slice(0, i2), w]);
        t1 = t1.slice(i1 + w);
        t2 = t2.slice(i2 + w);
    }
    return res;
}

// Находит первое изменение строки t2 по отношению к строке t1.
// d - минимальная длина неизменной части
// Возвращает измнение в виде списка [i1, i2, w], где 
//  i1 - число удаленных символов
//  i2 - длина вставленной строки
//  w - число сохраненных символов
function one_change(t1, t2, d=1) {
    let i1 = 0;
    for (; i1 < t1.length - d; i1++) {
        td = t1.slice(i1, i1 + d)
        let i2 = t2.indexOf(td);
        if (i2 !== -1) {
            // expand common part
            let w = d;
            while (i1 + w < t1.length && i2 + w < t2.length && t1[i1 + w] === t2[i2 + w])
                w++;
            return [i1, i2, w];
        }
    }
    // no common part
    return [t1.length, t2.length, 0]
}

// Восстанавливает текст по прототипу (t1) и изменениям (changes)
//
function restore(t1, changes) {
    if (changes.length === 0)
        return t1;
    t2 = "";
    for (let i = 0; i < changes.length; i += 3)
    {
        // n - number of chars to kill, 
        // txt - new text, 
        // m - number of chars to live 
        [n, txt, m] = [changes[i], changes[i + 1], changes[i + 2]];
        t2 += txt;                 // new part
        t2 += t1.slice(n, n + m);  // stable part
        t1 = t1.slice(n + m);      // cut t1
    }
    return t2;
}

module.exports = {
    changes,
	restore
}

////////////////////////////////////////////////
const ts = [
    ["01", "12345", "12345", [0, 0, 5]],
    ["02", "45", "12345", [0, 3, 2]],
    ["03", "12345", "45", [3, 0, 2]],
    ["04", "12345", "123", [0, 0, 3]],
    ["05", "123", "12345", [0, 0, 3]],
    ["06", "rrrwww", "gggwww", [3, 3, 3]],
    ["07", "rrrrrwww", "gggwww", [5, 3, 3]],
    ["08", "rrrwww", "gggggwww", [3, 5, 3]],
    ["09", "12345", "678", [5, 3, 0]],
    ["10", "123", "45678", [3, 5, 0]],
    ["11", "123456", "12a456", [0, 0, 2]],
    ["12", "3456", "a456", [1, 1, 3]],
    ["13", "456", "456", [0, 0, 3]], 
];
// test one_change
for (let t of ts) {
    act = one_change(t[1], t[2]);
    if (act.toString() !== t[3].toString()) 
        console.error(t[0], act);
}
// test changes
for (let t of ts) {
    log = changes(t[1], t[2]);
    act = restore(t[1], log);
    if (act.toString() !== t[2].toString()) 
        console.error(t[0], t[1], log, t[2], "act=" + act);
}

console.log("Tests OK.")

