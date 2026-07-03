import { registerExternalDiagrams } from 'mermaid';
import { drakonParser } from './parser/drakonParser';
import { f_svgBuilder_Build } from './svgBuilder';
import { f_layout_Calculate } from './layoutEngine';
import { DrakonDb } from './drakonDb';

// Mermaid 10.x external diagram API с renderer
const drakonPlugin = {
  id: 'drakon',
  detector: (text: string) => /^\s*drakon\b/.test(text),
  loader: () => ({
    parse: async (text: string) => {
      const result = await drakonParser.parse(text);
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.value.diagram;
    },
    renderer: {
      draw: async (svgId: string, diagram: unknown) => {
        const d = diagram as { nodes: any[]; edges: any[] };
        const layoutResult = f_layout_Calculate(d.nodes || [], d.edges || []);
        if (!layoutResult.ok) return `<svg><text y="20">${layoutResult.error}</text></svg>`;
        const svgResult = f_svgBuilder_Build(layoutResult.value.nodes, layoutResult.value.edges, {
          width: layoutResult.value.width,
          height: layoutResult.value.height
        });
        return svgResult.ok ? svgResult.value.svgString : `<svg><text y="20">${svgResult.error}</text></svg>`;
      }
    }
  })
};

registerExternalDiagrams([drakonPlugin]);

export default drakonPlugin;