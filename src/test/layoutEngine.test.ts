import { describe, test, expect } from 'vitest';
import { f_layout_Calculate } from '../layoutEngine';
import { DrakonNode } from '../drakonDb';

describe('Layout Engine', () => {
  test('simple linear diagram', () => {
    const a_nodes: DrakonNode[] = [
      { id: 'start', type: 'start', text: 'Начало' },
      { id: 'action1', type: 'action', text: 'Действие 1' },
      { id: 'end', type: 'end', text: 'Конец' },
    ];

    const a_edges = [
      { from: 'start', to: 'action1' },
      { from: 'action1', to: 'end' },
    ];

    const result = f_layout_Calculate(a_nodes, a_edges);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.nodes.length).toBe(3);
      expect(result.value.nodes[0].y).toBe(0);
    }
  });

  test('question diagram with branches', () => {
    const a_nodes: DrakonNode[] = [
      { id: 'start', type: 'start', text: 'Начало' },
      { id: 'question1', type: 'question', text: 'Вопрос?' },
      { id: 'yes_action', type: 'action', text: 'Да' },
      { id: 'no_action', type: 'action', text: 'Нет' },
      { id: 'end', type: 'end', text: 'Конец' },
    ];

    const a_edges = [
      { from: 'start', to: 'question1' },
      { from: 'question1', to: 'yes_action', label: 'Да' },
      { from: 'question1', to: 'no_action', label: 'Нет' },
      { from: 'yes_action', to: 'end' },
      { from: 'no_action', to: 'end' },
    ];

    const result = f_layout_Calculate(a_nodes, a_edges);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.nodes.length).toBeGreaterThan(0);
    }
  });
});