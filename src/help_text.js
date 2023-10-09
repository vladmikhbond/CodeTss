const content = `
Розв'язання задачі (контрольної або домашньої) починається в додатках TSS.
У вікні з умовою задачі вгорі праворуч знаходиться пін-код задачі.
Його треба скопіювати в буфер обміну і виконати команду PIN даного розширення.
  
Команди
------- 
PIN - відкриває поле введення, в яке треба помістити пін-код і натиснути Enter.
Через кілька секунд відкриється нове вікно редагування з умовою завдання у вигляді коментаря.
У цьому вікні й потрібно розв'язувати задачу.
      
CHECK - відправляє на перевірку код розв'язку з вікна редагування.
Рішенням вважається код, що знаходиться між коментарями BEGIN і END.
Якщо такої пари слів немає, рішенням вважається весь код у вікні редактора.

Нестандартні ситуації
----------------------
Після запуску VS Code у відповідь на команду PIN з'являється повідомлення "command ...not found"
  - розширення не встигло завантажитися, почекайте кілька секунд і повторіть команду.

Закрито всі вікна редагування і команди PIN і CHECK не видно
  - відкрийте будь-яке вікно редагування.

У відповідь на комнду PIN приходить повідомлення "ECONNREFUSED" (з'єднання відхилено сервером)
  - невірно скопійовано пін-код або неправильна конфігурація розширення (неправильні хост і порт).
`;

module.exports = {
    content
}