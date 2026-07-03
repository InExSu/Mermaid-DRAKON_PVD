import { registerExternalDiagrams } from 'mermaid';
import { drakonParser } from './parser/drakonParser';
import { f_svgBuilder_Build } from './svgBuilder';
import { f_layout_Calculate } from './layoutEngine';
import { DrakonDb } from './drakonDb';

const drakonPlugin = {
  id: 'drakon',
  detector: (text: string) => /^\s*drakon\b/.test(text),
  loader: async () => {
    return {
      parse: async (text: string) => {
        try {
          const result = await drakonParser.parse(text);
          
          if (!result.ok) {
            throw new Error(result.error);
          }
          
          return {
            type: 'drakonDiagram',
            nodes: result.value.diagram.nodes,
            edges: result.value.diagram.edges
          };
        } catch (error: any) {
          throw error;
        }
      },
      
      renderer: {
        draw: async (svgId: string, diagram: any, _config: any) => {
          const nodes = diagram.nodes || [];
          const edges = diagram.edges || [];
          
          // Calculate layout
          const layoutResult = f_layout_Calculate(nodes, edges);
          if (!layoutResult.ok) {
            return `<text x="50%" y="50%" text-anchor="middle" fill="red">Layout error: ${layoutResult.error}</text>`;
          }
          
          // Build SVG
          const svgResult = f_svgBuilder_Build(
            layoutResult.value.nodes,
            layoutResult.value.edges,
            { width: layoutResult.value.width, height: layoutResult.value.height }
          );
          
          if (!svgResult.ok) {
            return `<text x="50%" y="50%" text-anchor="middle" fill="red">SVG error: ${svgResult.error}</text>`;
          }
          
          return svgResult.value.svgString;
        }
      }
    };
  }
};

registerExternalDiagrams([drakonPlugin]);

export default drakonPlugin;