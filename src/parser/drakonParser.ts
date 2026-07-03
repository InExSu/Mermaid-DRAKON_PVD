// src/parser/drakonParser.ts
// Simplified parser implementation that works with our grammar
export class DrakonParser {
  async parse(text: string) {
    try {
      // Simple parser implementation using basic text processing
      const lines = text.trim().split('\n').filter(line => line.trim() !== '');
      const nodes: { id: string; type: string; text: string; width?: number; height?: number }[] = [];
      const edges: { from: string; to: string; label?: string }[] = [];

      let currentNodeId: string | null = null;
      let lastNodeId: string | null = null;
      let currentQuestionId: string | null = null;

      // Helper to generate unique ID
      const uid = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;
        if (line === 'drakon') continue;

        // Detect node types with explicit keywords
        if (line.startsWith('Начало:')) {
          const node = this._parseNode(line, 'start');
          const id = node.id || uid();
          nodes.push({ ...node, id, width: 160, height: 60 });
          currentNodeId = id;
          lastNodeId = id;
          continue;
        }
        if (line.startsWith('Конец:')) {
          const node = this._parseNode(line, 'end');
          const id = node.id || uid();
          nodes.push({ ...node, id, width: 160, height: 60 });
          currentNodeId = id;
          lastNodeId = id;
          continue;
        }
        if (line.startsWith('Вопрос:')) {
          const node = this._parseQuestionNode(line);
          const id = node.id || uid();
          nodes.push({ ...node, id, width: 120, height: 60 });
          currentNodeId = id;
          lastNodeId = id;
          currentQuestionId = id;
          continue;
        }
        if (line.startsWith('Действие:')) {
          const node = this._parseNode(line, 'action');
          const id = node.id || uid();
          nodes.push({ ...node, id, width: 160, height: 60 });
          currentNodeId = id;
          if (lastNodeId && lastNodeId !== id) {
            edges.push({ from: lastNodeId, to: id });
          }
          lastNodeId = id;
          continue;
        }
        if (line.startsWith('Ввод/Вывод:')) {
          const node = this._parseNode(line, 'io');
          const id = node.id || uid();
          nodes.push({ ...node, id, width: 160, height: 60 });
          currentNodeId = id;
          if (lastNodeId && lastNodeId !== id) {
            edges.push({ from: lastNodeId, to: id });
          }
          lastNodeId = id;
          continue;
        }

        // Handle labeled branches: Да: "text" ->  or Нет: "text" ->
        if ((line.startsWith('Да:') || line.startsWith('Нет:')) && line.includes('->')) {
          const label = line.startsWith('Да:') ? 'Да' : 'Нет';
          // Remove label and colon
          const afterLabel = line.substring(line.indexOf(':') + 1).trim();
          // Split by '->'
          const parts = afterLabel.split('->');
          const nodeTextPart = parts[0].trim();
          // Extract text (remove quotes)
          let nodeText = nodeTextPart.replace(/^"|"$/g, '');
          if (nodeText.startsWith('"') && nodeText.endsWith('"')) {
            nodeText = nodeText.substring(1, nodeText.length - 1);
          }
          // Create an action node for this label text
          const nodeId = uid();
          nodes.push({
            id: nodeId,
            type: 'action',
            text: nodeText,
            width: 160,
            height: 60
          });
          // Edge from current question to this node with label
          if (currentQuestionId) {
            edges.push({ from: currentQuestionId, to: nodeId, label });
          }
          // Set this as last node for potential chaining
          lastNodeId = nodeId;
          // The part after '->' may contain another node or be empty; we'll handle in next iterations
          continue;
        }

        // Handle plain quoted string line (like a node without keyword)
        if (line.startsWith('"') && line.endsWith('"')) {
          const text = line.substring(1, line.length - 1);
          const nodeId = uid();
          nodes.push({
            id: nodeId,
            type: 'action',
            text,
            width: 160,
            height: 60
          });
          if (lastNodeId && lastNodeId !== nodeId) {
            edges.push({ from: lastNodeId, to: nodeId });
          }
          lastNodeId = nodeId;
          continue;
        }

        // Handle regular edges: something -> something
        if (line.includes('->')) {
          const parts = line.split('->');
          if (parts.length >= 2) {
            const fromPart = parts[0].trim();
            const toPart = parts[1].trim();

            // Extract IDs (take first word before space or colon)
            const fromMatch = fromPart.match(/^([^\s:]+)/);
            const toMatch = toPart.match(/^([^\s:]+)/);

            if (fromMatch && toMatch) {
              const fromId = fromMatch[1];
              const toId = toMatch[1];
              // Find existing nodes by id (they should have been created earlier)
              const fromNode = nodes.find(n => n.id === fromId);
              const toNode = nodes.find(n => n.id === toId);
              if (fromNode && toNode) {
                edges.push({ from: fromId, to: toId });
                lastNodeId = toId;
              }
            }
          }
          continue;
        }

        // If we reach here, line didn't match any pattern; ignore or treat as action node with empty text?
        // For safety, we can create an action node with the line as text (without quotes)
        const nodeId = uid();
        nodes.push({
          id: nodeId,
          type: 'action',
          text: line.replace(/^"|"$/g, ''),
          width: 160,
          height: 60
        });
        if (lastNodeId && lastNodeId !== nodeId) {
          edges.push({ from: lastNodeId, to: nodeId });
        }
        lastNodeId = nodeId;
      }

      // Ensure we have at least one start and end
      if (!nodes.some(n => n.type === 'start')) {
        nodes.unshift({
          id: uid(),
          type: 'start',
          text: 'Начало',
          width: 160,
          height: 60
        });
      }
      if (!nodes.some(n => n.type === 'end')) {
        nodes.push({
          id: uid(),
          type: 'end',
          text: 'Конец',
          width: 160,
          height: 60
        });
      }

      return {
        ok: true,
        value: {
          diagram: {
            nodes,
            edges
          }
        }
      };
    } catch (error: any) {
      return {
        ok: false,
        error: `Failed to parse DRAKON diagram: ${error.message}`
      };
    }
  }

  private _parseNode(line: string, type: string): { id: string; type: string; text: string } {
    const parts = line.split(':');
    const idText = parts[1].trim();
    const [id, text] = this._splitIdAndText(idText);
    
    return {
      id: id || '',
      type,
      text: text || ''
    };
  }

  private _parseQuestionNode(line: string): { id: string; type: string; text: string } {
    const parts = line.split(':');
    const idText = parts[1].trim();
    const [id, text] = this._splitIdAndText(idText);
    
    return {
      id: id || '',
      type: 'question' as const,
      text: text || ''
    };
  }

  private _splitIdAndText(text: string): [string, string] {
    // Remove quotes and split
    const cleanText = text.replace(/^"|"$/g, '');
    const firstSpace = cleanText.indexOf(' ');
    if (firstSpace === -1) {
      return [cleanText, ''];
    }
    
    return [
      cleanText.substring(0, firstSpace),
      cleanText.substring(firstSpace + 1).replace(/^"|"$/g, '')
    ];
  }
}

export const drakonParser = new DrakonParser();