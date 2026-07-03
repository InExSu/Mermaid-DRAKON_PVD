import { DrakonNode, DrakonEdge } from './drakonDb';
import { type Result } from './pureFunctions';

interface SvgBuilderResult {
  svgString: string;
  width: number;
  height: number;
}

function f_svgBuilder_Build(
  a_nodes: DrakonNode[],
  a_edges: DrakonEdge[],
  o_options?: { width?: number; height?: number }
): Result<SvgBuilderResult> {
  if (!a_nodes || a_nodes.length === 0) {
    return { ok: false, error: 'f_svgBuilder_Build: no nodes provided' };
  }

  const i_width = o_options?.width || 400;
  const i_height = o_options?.height || 300;

  const a_pathData: string[] = [];

  // Add marker definitions
  const a_markerDefs: string[] = [];

  // Add marker definitions
  a_markerDefs.push(
    '<defs>',
    '  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">',
    '    <polygon points="0 0, 10 3.5, 0 7" fill="#000"/>',
    '  </marker>',
    '</defs>'
  );

  // Build paths for edges
  const m_nodeMap = new Map(a_nodes.map((m_node) => [m_node.id, m_node]));

  // Build paths for edges
  for (const m_edge of a_edges) {
    const m_fromNode = m_nodeMap.get(m_edge.from);
    const m_toNode = m_nodeMap.get(m_edge.to);

    if (!m_fromNode || !m_toNode) continue;

    const i_fromX = m_fromNode.x || 0;
    const i_fromY = m_fromNode.y || 0;
    const i_fromW = m_fromNode.width || 160;
    const i_fromH = m_fromNode.height || 60;

    const i_toX = m_toNode.x || 0;
    const i_toY = m_toNode.y || 0;
    const i_toW = m_toNode.width || 160;
    const i_toH = m_toNode.height || 60;

    // Calculate connection points
    const i_fromCenterX = i_fromX + i_fromW / 2;
    const i_fromCenterY = i_fromY + i_fromH / 2;
    const i_toCenterX = i_toX + i_toW / 2;
    const i_toCenterY = i_toY + i_toH / 2;

    // Create orthogonal path
    const s_path = f_pathOrthogonalPath(i_fromCenterX, i_fromCenterY, i_toCenterX, i_toCenterY);
    a_pathData.push(`<path d="${s_path}" stroke="#000" stroke-width="2" fill="none" marker-end="url(#arrowhead)" />`);
  }

  // Build nodes
  const a_nodeElements: string[] = [];
  for (const m_node of a_nodes) {
    const i_x = m_node.x || 0;
    const i_y = m_node.y || 0;
    const i_w = m_node.width || 160;
    const i_h = m_node.height || 60;

    const s_element = createNodeElement(m_node, i_x, i_y, i_w, i_h);
    a_nodeElements.push(s_element);
  }

  // Combine all elements
  const s_svgContent = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${i_width} ${i_height}">`,
    a_markerDefs.join('\n'),
    ...a_pathData,
    ...a_nodeElements,
    '</svg>',
  ].join('\n');

  return {
    ok: true,
    value: {
      svgString: s_svgContent,
      width: i_width,
      height: i_height,
    },
  };
}

function f_pathOrthogonalPath(i_x1: number, i_y1: number, i_x2: number, i_y2: number): string {
  const a_points: string[] = [];

  // Determine direction and create orthogonal path
  if (Math.abs(i_x2 - i_x1) < Math.abs(i_y2 - i_y1)) {
    // Vertical movement dominant
    a_points.push(`M ${i_x1} ${i_y1}`);
    a_points.push(`L ${i_x1} ${i_y2}`);
    a_points.push(`L ${i_x2} ${i_y2}`);
  } else {
    // Horizontal movement dominant
    a_points.push(`M ${i_x1} ${i_y1}`);
    a_points.push(`L ${i_x2} ${i_y1}`);
    a_points.push(`L ${i_x2} ${i_y2}`);
  }

  return a_points.join(' ');
}

function createNodeElement(m_node: DrakonNode, i_x: number, i_y: number, i_w: number, i_h: number): string {
  const s_shape = getShape(m_node.type);
  const s_text = m_node.text || '';

  return `<g transform="translate(${i_x}, ${i_y})">
    ${s_shape}
    <text x="${i_w / 2}" y="${i_h / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="14" fill="#000">${s_text}</text>
  </g>`;
}

function getShape(s_type: string): string {
  switch (s_type) {
    case 'start':
    case 'end':
      return `<ellipse cx="80" cy="30" rx="80" ry="30" fill="#fff" stroke="#000" stroke-width="2" />`;
    case 'question':
      return `<polygon points="60,0 120,30 60,60 0,30" fill="#fff" stroke="#000" stroke-width="2" />`;
    case 'action':
      return `<rect x="0" y="0" width="160" height="60" rx="5" ry="5" fill="#fff" stroke="#000" stroke-width="2" />`;
    case 'io':
      return `<polygon points="40,0 140,0 160,30 60,30" fill="#fff" stroke="#000" stroke-width="2" />`;
    default:
      return `<rect x="0" y="0" width="160" height="60" fill="#fff" stroke="#000" stroke-width="2" />`;
  }
}

export { f_svgBuilder_Build, type SvgBuilderResult };