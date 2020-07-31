const D = 10;

// Находит все изменения строки t2 по отношению к строке t1.
// d - минимальная длина неизменной части.
// Каждое изменение - это тройка: n, t, m, где 
//  n - число удаленных символов
//  t - вставленная строка
//  m - число сохраненных символов
// Возвращает список, длина которого кратна 3. Пустой список означает отсутствие изменений.
function changes(t1, t2, d = D) {
    if (t1 === t2)
        return [];

    let res = [];
    while (t1 !== "" || t2 !== "") {
        [i1, i2, w] = one_change(t1, t2, d);
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
function one_change(t1, t2, d) {
    let i1 = 0;
    for (; i1 < t1.length - d; i1++) {
        let td = t1.slice(i1, i1 + d);
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

// more complex version
function one_change_co(t1, t2, d) {
    let [b1, b2] = [Number.MAX_VALUE, Number.MAX_VALUE];
    for (let i1 = 0; i1 < t1.length - d; i1++) {
        let td = t1.slice(i1, i1 + d);
        let i2 = t2.indexOf(td);
        // common part found
        if (i2 !== -1) {
            if (i1 + i2 < b1 + b2) {
                [b1, b2] = [i1, i2];
            }
        }
    }
    // no common part
    if (b1 === Number.MAX_VALUE)
        return [t1.length, t2.length, 0];

    let w = _expand_common_part(b1, b2);
    return [b1, b2, w];


    function _expand_common_part(i1, i2) {
        let w = d;
        while (i1 + w < t1.length && i2 + w < t2.length && t1[i1 + w] === t2[i2 + w])
            w++;
        return w;
    }
}

// Восстанавливает текст по прототипу (t1) и изменениям (changes)
//
function restore(t1, changes) {
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

// Подсчет активности на одном элементе лога
// возвращает число удаленных и число вставленных символов
//
function activity(log_item) {
    let add = 0;
    let del = 0;
    for (let i = 0; i < log_item.length; i += 3) {
        add += log_item[i + 1].length;
        del += log_item[i];
    }
    return { add, del };
}

// Пересборка нагруженного лога с целью отделения нагрузки
// возвращает ненагруженный лог и согласованный с ним список состояний
//
function separate_log(loaded_log, separator) {
    const log = [];
    const states = [];
    let frame = "";
    let frame0 = "";
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
    return { log, states };
}


module.exports = {
   changes,
   one_change,
   restore,
   activity,
   separate_log
};
