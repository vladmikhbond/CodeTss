# code-tss README

Данное расширение должно превратить vs code в IDE for TSS
Функции расширения
- возврат пин-кода на сервер (сейчас это Exam30)
- получение условия задачи и др данных с сервера
- накопление лога
- отправка решения на проверку вместе с накопленным логом
- конфигурирование расширения (host и port сервера)
## Основной сценарий
Юзер открывает VS Code и в открытом окне редактора видит меню "PIN  CHECK  HELP"
(если все окна редактора кода закрыты, нужно открыть, хотя бы одно).
В меню выбирает пункт PIN и вводит пин.
Открывается новое окно редактирования и в нем появляется условие задачи.
Юзер решает задачу, и при помощи меню CHECK отправляет на проверку 
часть кода, выделенную ограничителями.


