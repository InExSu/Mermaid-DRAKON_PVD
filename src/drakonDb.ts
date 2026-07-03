type DrakonNodeType = 'start' | 'end' | 'question' | 'action' | 'io';

interface DrakonNode {
  id: string;
  type: DrakonNodeType;
  text: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface DrakonEdge {
  from: string;
  to: string;
  label?: 'Да' | 'Нет';
}

interface DrakonDiagram {
  nodes: DrakonNode[];
  edges: DrakonEdge[];
}

class DrakonDb {
  private a_nodes: Map<string, DrakonNode> = new Map();
  private a_edges: DrakonEdge[] = [];

  f_node_Add(m_node: DrakonNode): Result<void> {
    if (!m_node || !m_node.id || !m_node.type) {
      return { ok: false, error: 'f_node_Add: missing required properties in node' };
    }

    const s_validTypes: DrakonNodeType[] = ['start', 'end', 'question', 'action', 'io'];
    if (!s_validTypes.includes(m_node.type)) {
      return { ok: false, error: `f_node_Add: invalid type "${m_node.type}"` };
    }

    if (this.a_nodes.has(m_node.id)) {
      return { ok: false, error: `f_node_Add: node with id "${m_node.id}" already exists` };
    }

    this.a_nodes.set(m_node.id, m_node);
    return { ok: true, value: undefined };
  }

  f_edge_Add(m_edge: DrakonEdge): Result<void> {
    if (!m_edge || !m_edge.from || !m_edge.to) {
      return { ok: false, error: 'f_edge_Add: missing from or to in edge' };
    }

    const b_fromExists = this.a_nodes.has(m_edge.from);
    const b_toExists = this.a_nodes.has(m_edge.to);

    if (!b_fromExists || !b_toExists) {
      return { ok: false, error: `f_edge_Add: node not found (from: ${m_edge.from}, to: ${m_edge.to})` };
    }

    this.a_edges.push(m_edge);
    return { ok: true, value: undefined };
  }

  f_nodes_Get(): DrakonNode[] {
    return Array.from(this.a_nodes.values());
  }

  f_edges_Get(): DrakonEdge[] {
    return [...this.a_edges];
  }

  f_node_Start_Get(): Result<DrakonNode> {
    const a_startNodes = this.f_nodes_Get().filter((m_node) => m_node.type === 'start');

    if (a_startNodes.length === 0) {
      return { ok: false, error: 'f_node_Start_Get: no start node found' };
    }

    if (a_startNodes.length > 1) {
      return { ok: false, error: 'f_node_Start_Get: multiple start nodes found' };
    }

    return { ok: true, value: a_startNodes[0] };
  }

  f_validate(): Result<boolean> {
    const a_nodes = this.f_nodes_Get();

    // Check for exactly one start node
    const i_startCount = a_nodes.filter((m_node) => m_node.type === 'start').length;
    if (i_startCount !== 1) {
      return { ok: false, error: `f_validate: expected 1 start node, got ${i_startCount}` };
    }

    // Check for exactly one end node
    const i_endCount = a_nodes.filter((m_node) => m_node.type === 'end').length;
    if (i_endCount !== 1) {
      return { ok: false, error: `f_validate: expected 1 end node, got ${i_endCount}` };
    }

    // Check all question nodes have both Да and Нет edges
    const a_questions = a_nodes.filter((m_node) => m_node.type === 'question');
    for (const m_question of a_questions) {
      const a_yesEdges = this.a_edges.filter(
        (m_edge) => m_edge.from === m_question.id && m_edge.label === 'Да'
      );
      const a_noEdges = this.a_edges.filter(
        (m_edge) => m_edge.from === m_question.id && m_edge.label === 'Нет'
      );

      if (a_yesEdges.length !== 1) {
        return { ok: false, error: `f_validate: question "${m_question.id}" missing Да edge` };
      }
      if (a_noEdges.length !== 1) {
        return { ok: false, error: `f_validate: question "${m_question.id}" missing Нет edge` };
      }
    }

    // Check for cycles
    if (this.f_hasCycles()) {
      return { ok: false, error: 'f_validate: diagram contains cycles' };
    }

    return { ok: true, value: true };
  }

  private f_hasCycles(): boolean {
    const a_visited: Set<string> = new Set();
    const a_recursionStack: Set<string> = new Set();

    const f_dfs = (s_nodeId: string): boolean => {
      if (a_recursionStack.has(s_nodeId)) {
        return true;
      }
      if (a_visited.has(s_nodeId)) {
        return false;
      }

      a_visited.add(s_nodeId);
      a_recursionStack.add(s_nodeId);

      const a_neighbors = this.a_edges
        .filter((m_edge) => m_edge.from === s_nodeId)
        .map((m_edge) => m_edge.to);

      for (const s_neighbor of a_neighbors) {
        if (f_dfs(s_neighbor)) {
          return true;
        }
      }

      a_recursionStack.delete(s_nodeId);
      return false;
    };

    for (const m_node of this.f_nodes_Get()) {
      if (f_dfs(m_node.id)) {
        return true;
      }
    }

    return false;
  }

  f_clear(): void {
    this.a_nodes.clear();
    this.a_edges = [];
  }
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export { DrakonDb, type DrakonNode, type DrakonEdge, type DrakonDiagram, type DrakonNodeType };
export { type Result };