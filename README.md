# Mermaid DRAKON Plugin

Плагин для Mermaid.js, поддерживающий диаграммы ДРАКОН (Алгоритмические диаграммы Паронджанова В.Д.).

## Установка

```bash
npm install mermaid-drakon
```

## Использование

```html
<script type="module">
  import mermaid from 'mermaid';
  import drakonPlugin from 'mermaid-drakon';
  
  mermaid.registerExternalDiagrams([drakonPlugin]);
  mermaid.initialize({ startOnLoad: true });
</script>
```

## Синтаксис

```
drakon
  Начало: "Название процесса"
  Вопрос: "Есть данные?" ->
    Да: "Обработать" ->
      "Сохранить"
    Нет: "Ожидать" ->
      "Конец"
  Конец: "Завершение"
```

## Типы блоков

- `Начало` — начальный блок (эллипс)
- `Конец` — конечный блок (эллипс)
- `Вопрос` — условный блок с ветвлением Да/Нет
- `Действие` — блок выполнения действия
- `Ввод/Вывод` — блок ввода-вывода (параллелограмм)

## Разработка

```bash
npm install
npm run dev   # Режим разработки
npm test      # Запуск тестов
npm run build # Сборка
```

## Лицензия

MIT