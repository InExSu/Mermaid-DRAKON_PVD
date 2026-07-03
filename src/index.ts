import { registerExternalDiagrams } from 'mermaid';
import { drakonParser } from './parser/drakonParser';
import { f_svgBuilder_Build } from './svgBuilder';
import { f_layout_Calculate } from './layoutEngine';
import { DrakonDb } from './drakonDb';

// Полный API для Mermaid 10.x внешних диаграмм
const drakonPlugin = {
  id: 'drakon',
  detector: (text: string) => /^\s*drakon\b/.test(text),
  loader: () => ({
    parse: async (text: string) => {
      const result = await drakonParser.parse(text);
      if (!result.ok) {
        throw new Error(result.error);
      }
      return {
        type: 'drakonDiagram',
        nodes: result.value.diagram.nodes,
        edges: result.value.diagram.edges
      };
    },
    renderer: {
      // Mermaid вызывает draw для рендеринга
      draw: async (svgId: string, diagram: unknown, _config: unknown) => {
        const d = diagram as { nodes: any[]; edges: any[] };
        const layoutResult = f_layout_Calculate(d.nodes || [], d.edges || []);
        if (!layoutResult.ok) return '<text x="50%" y="50%">Error</text>';
        const svgResult = f_svgBuilder_Build(layoutResult.value.nodes, layoutResult.value.edges, {
          width: layoutResult.value.width,
          height: layoutResult.value.height
        });
        return svgResult.ok ? svgResult.value.svgString : '<text x="50%" y="50%">Render Error</text>';
      }
    }
  })
};

registerExternalDiagrams([drakonPlugin]);

export default drakonPlugin;