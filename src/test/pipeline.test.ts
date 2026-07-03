import { drakonParser } from '../parser/drakonParser';

describe('Full Pipeline', () => {
  test('complete diagram processing', async () => {
    const diagramText = `
      drakon
        Начало: "Начало"
        Вопрос: "Проверка?" ->
          Да: "Да, все ok" ->
            "Следующий шаг"
          Нет: "Нет, ошибка" ->
            "Обработать ошибку"
        Конец: "Завершение"
    `;

    // Parse the diagram
    const parseResult = await drakonParser.parse(diagramText);
    
    expect(parseResult.ok).toBe(true);
    if (parseResult.ok) {
      const diagram = parseResult.value.diagram;
      
      // Should have diagram structure
      expect(diagram.nodes).toBeDefined();
      expect(diagram.edges).toBeDefined();
      expect(diagram.edges.length).toBeGreaterThanOrEqual(1);
    }
  });
  
  test('simple linear diagram', async () => {
    const diagramText = `
      drakon
        Начало: "Start"
        Действие: "Process"
        Конец: "End"
    `;

    const parseResult = await drakonParser.parse(diagramText);
    expect(parseResult.ok).toBe(true);
    
    if (parseResult.ok) {
      const diagram = parseResult.value.diagram;
      
      // Should have start, action, end
      const startNodes = diagram.nodes.filter(n => n.type === 'start');
      const actionNodes = diagram.nodes.filter(n => n.type === 'action');
      const endNodes = diagram.nodes.filter(n => n.type === 'end');
      
      expect(startNodes.length).toBeGreaterThanOrEqual(1);
      expect(actionNodes.length).toBeGreaterThanOrEqual(1);
      expect(endNodes.length).toBeGreaterThanOrEqual(1);
    }
  });
});