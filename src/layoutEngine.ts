import { DrakonNode, DrakonEdge, type Result } from './drakonDb';

interface LayoutResult {
  nodes: DrakonNode[];
  width: number;
  height: number;
}

interface LayoutOptions {
  horizontalSpacing: number;
  verticalSpacing: number;
  mainAxisX: number;
  branchOffset: number;
}

const DEFAULT_OPTIONS: LayoutOptions = {
  horizontalSpacing: 50,
  verticalSpacing: 80,
  mainAxisX: 200,
  branchOffset: 200,
};

// Pure function: calculate layout without side effects
function f_layout_Calculate(
  a_nodes: DrakonNode[],
  a_edges: DrakonEdge[],
  o_options: Partial<LayoutOptions> = {}
): Result<LayoutResult> {
  const o_cfg = { ...DEFAULT_OPTIONS, ...o_options };

  if (!a_nodes || a_nodes.length === 0) {
    return { ok: false, error: 'f_layout_Calculate: no nodes provided' };
  }

  // Validate that we have a start node
  const m_startResult = f_node_GetStart(a_nodes);
  if (!m_startResult.ok) {
    return m_startResult;
  }

  const m_startNode = m_startResult.value;
  const a_graph = f_graph_Build(a_nodes, a_edges);

  const a_layoutedNodes: DrakonNode[] = [];
  const i_visitedMaxY = f_layout_Dfs(
    m_startNode.id,
    a_nodes,
    a_edges,
    a_graph,
    0,
    o_cfg.mainAxisX,
    a_layoutedNodes,
    o_cfg
  );

  const i_maxY = a_layoutedNodes.reduce((m_max, m_node) => {
    return Math.max(m_max, (m_node.y || 0) + (m_node.height || 0));
  }, i_visitedMaxY);

  return {
    ok: true,
    value: {
      nodes: a_layoutedNodes,
      width: o_cfg.mainAxisX + o_cfg.branchOffset * 2,
      height: i_maxY + o_cfg.verticalSpacing,
    },
  };
}

function f_node_GetStart(a_nodes: DrakonNode[]): Result<DrakonNode> {
  const a_startNodes = a_nodes.filter((m_node) => m_node.type === 'start');

  if (a_startNodes.length === 0) {
    return { ok: false, error: 'f_node_GetStart: no start node found' };
  }

  if (a_startNodes.length > 1) {
    return { ok: false, error: 'f_node_GetStart: multiple start nodes found' };
  }

  return { ok: true, value: a_startNodes[0] };
}

function f_graph_Build(a_nodes: DrakonNode[], a_edges: DrakonEdge[]): Map<string, string[]> {
  const m_graph: Map<string, string[]> = new Map();

  for (const m_node of a_nodes) {
    m_graph.set(m_node.id, []);
  }

  for (const m_edge of a_edges) {
    const a_neighbors = m_graph.get(m_edge.from) || [];
    a_neighbors.push(m_edge.to);
    m_graph.set(m_edge.from, a_neighbors);
  }

  return m_graph;
}

function f_layout_Dfs(
  s_nodeId: string,
  a_allNodes: DrakonNode[],
  a_allEdges: DrakonEdge[],
  m_graph: Map<string, string[]>,
  i_currentY: number,
  i_currentX: number,
  a_layoutedNodes: DrakonNode[],
  o_options: LayoutOptions
): number {
  const m_node = a_allNodes.find((m_n) => m_n.id === s_nodeId);

  if (!m_node) {
    return i_currentY;
  }

  // Add node to layouted nodes
  a_layoutedNodes.push({
    ...m_node,
    x: i_currentX,
    y: i_currentY,
    width: m_node.type === 'question' ? 120 : 160,
    height: 60,
  });

  const s_nodeType = m_node.type;
  const i_nodeHeight = m_node.height || 60;

  // For non-question nodes, just place next node below
  if (s_nodeType !== 'question') {
    const a_outEdges = a_allEdges.filter((m_edge) => m_edge.from === s_nodeId);
    if (a_outEdges.length > 0) {
      const s_nextNodeId = a_outEdges[0].to;
      return f_layout_Dfs(
        s_nextNodeId,
        a_allNodes,
        a_allEdges,
        m_graph,
        i_currentY + i_nodeHeight + o_options.verticalSpacing,
        i_currentX,
        a_layoutedNodes,
        o_options
      );
    }
    return i_currentY;
  }

  // For question nodes, handle branching
  const a_yesEdge = a_allEdges.find(
    (m_edge) => m_edge.from === s_nodeId && m_edge.label === 'Да'
  );
  const a_noEdge = a_allEdges.find(
    (m_edge) => m_edge.from === s_nodeId && m_edge.label === 'Нет'
  );

  let i_maxY = i_currentY;

  // Process "Да" branch (goes right)
  if (a_yesEdge) {
    const i_branchX = o_options.mainAxisX + o_options.branchOffset;
    const i_branchStartY = i_currentY + i_nodeHeight;

    // Add intermediate node for the return path
    a_layoutedNodes.push({
      id: `${s_nodeId}_yes_branch_return`,
      type: 'action',
      text: '',
      x: o_options.mainAxisX,
      y: i_branchStartY + o_options.verticalSpacing * 2,
      width: 1,
      height: 1,
    });

    i_maxY = Math.max(
      i_maxY,
      f_layout_Branch(
        a_yesEdge.to,
        a_allNodes,
        a_allEdges,
        m_graph,
        i_branchStartY,
        i_branchX,
        o_options.mainAxisX,
        o_options,
        a_layoutedNodes
      )
    );
  }

  // Process "Нет" branch (goes left)
  if (a_noEdge) {
    const i_branchX = o_options.mainAxisX - o_options.branchOffset;
    const i_branchStartY = i_currentY + i_nodeHeight;

    // Add intermediate node for the return path
    a_layoutedNodes.push({
      id: `${s_nodeId}_no_branch_return`,
      type: 'action',
      text: '',
      x: o_options.mainAxisX,
      y: i_currentY + o_options.verticalSpacing * 2 + 50,
      width: 1,
      height: 1,
    });

    i_maxY = Math.max(
      i_maxY,
      f_layout_Branch(
        a_noEdge.to,
        a_allNodes,
        a_allEdges,
        m_graph,
        i_branchStartY,
        i_branchX,
        o_options.mainAxisX,
        o_options,
        a_layoutedNodes
      )
    );
  }

  return i_maxY;
}

function f_layout_Branch(
  s_nodeId: string,
  a_allNodes: DrakonNode[],
  a_allEdges: DrakonEdge[],
  m_graph: Map<string, string[]>,
  i_currentY: number,
  i_branchX: number,
  i_mainAxisX: number,
  o_options: LayoutOptions,
  a_layoutedNodes: DrakonNode[]
): number {
  const m_node = a_allNodes.find((m_n) => m_n.id === s_nodeId);

  if (!m_node) {
    return i_currentY;
  }

  const i_nodeHeight = m_node.height || 60;

  // Add node to layout on branch axis
  a_layoutedNodes.push({
    ...m_node,
    x: i_branchX,
    y: i_currentY,
    width: m_node.type === 'question' ? 120 : 160,
    height: i_nodeHeight,
  });

  // Continue layout on branch if it's a question
  if (m_node.type === 'question') {
    const i_maxY = f_layout_Dfs(
      s_nodeId,
      a_allNodes,
      a_allEdges,
      m_graph,
      i_currentY,
      i_branchX,
      a_layoutedNodes,
      o_options
    );
    return i_maxY;
  }

  // For non-question nodes, check for next edge and continue on branch
  const a_outEdges = a_allEdges.filter((m_edge) => m_edge.from === s_nodeId);
  if (a_outEdges.length > 0) {
    const s_nextNodeId = a_outEdges[0].to;
    return f_layout_Branch(
      s_nextNodeId,
      a_allNodes,
      a_allEdges,
      m_graph,
      i_currentY + i_nodeHeight + o_options.verticalSpacing,
      i_branchX,
      i_mainAxisX,
      o_options,
      a_layoutedNodes
    );
  }

  return i_currentY + i_nodeHeight;
}

export { f_layout_Calculate, type LayoutResult, type LayoutOptions };