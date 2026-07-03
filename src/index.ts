import { registerExternalDiagrams } from 'mermaid';
import { drakonParser } from './parser/drakonParser';
import { f_svgBuilder_Build } from './svgBuilder';
import { f_layout_Calculate } from './layoutEngine';
import { DrakonDb } from './drakonDb';

// Mermaid 10.x full API schema
const drakonPlugin = {
  id: 'drakon',
  detector: (text: string) => /^\s*drakon\b/.test(text),
  loader: () => ({
    parse: async (text: string) => {
      const result = await drakonParser.parse(text);
      if (!result.ok) {
        throw new Error(result.error);
      }
      // Return the diagram data in a format Mermaid can process
      return result.value.diagram;
    },
    draw: async (svgId: string, diagram: unknown, config: unknown) => {
      const d = diagram as { nodes: any[]; edges: any[] };
      const layoutResult = f_layout_Calculate(d.nodes || [], d.edges || []);
      if (!layoutResult.ok) return '<svg><text y="20">Layout Error</text></svg>';
      const svgResult = f_svgBuilder_Build(layoutResult.value.nodes, layoutResult.value.edges, {
        width: layoutResult.value.width,
        height: layoutResult.value.height
      });
      return svgResult.ok ? svgResult.value.svgString : '<svg><text y="20">Render Error</text></svg>';
    }
  })
};

registerExternalDiagrams([drakonPlugin]);

export default drakonPlugin;