/* eslint-disable no-undef */

// Находит все изменения строки t2 по отношению к строке t1.
// d - минимальная длина неизменной части.
// Каждое изменение - это тройка: n, t, m, где 
//  n - число удаленных символов
//  t - вставленная строка
//  m - число сохраненных символов
// Возвращает список, длина которого кратна 3. Пустой список означает отсутствие изменений.
function changes(t1, t2, d) {
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
function one_change(t1, t2, d) {
    let i1 = 0; 
    for (; i1 < t1.length - d; i1++) {
        td = t1.slice(i1, i1 + d)
        let i2 = t2.indexOf(td);
        if (i2 !== -1) {
            // expand common part
            let w = d;
            while(i1 + w < t1.length && i2 + w < t2.length && t1[i1 + w] == t2[i2 + w]) 
                w++;
            return [i1, i2, w] 
        }
    }
    // no common part
    return [t1.length, t2.length, 0]  
}

function restore(t1, ps) {
   if (ps.length === 0 )
        return t1; 
   t2 = "";
   for(let i = 0; i < ps.length; i += 3) {
        [i1, t, w] = [ps[i], ps[i+1], ps[i+2]];
        t2 += t;   // new
        t2 += t1.slice(i1, w);  // old
        t1 = t1.slice(i1 + w);   
   }
   return t2;
}


module.exports = {
    changes, 
    restore,
}

