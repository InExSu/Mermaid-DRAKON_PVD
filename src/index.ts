import { registerExternalDiagrams } from 'mermaid';
import { drakonParser } from './parser/drakonParser';
import { f_svgBuilder_Build, f_layout_Calculate } from './svgBuilder';

// Mermaid 10.x external diagram format
const drakonPlugin = {
  id: 'drakon',
  detector: (text: string) => /^\s*drakon\b/.test(text),
  loader: async () => {
    return {
      parse: async (text: string) => {
        const result = await drakonParser.parse(text);
        if (!result.ok) {
          throw new Error(result.error);
        }
        return {
          type: 'drakon',
          nodes: result.value.diagram.nodes,
          edges: result.value.diagram.edges
        };
      }
    };
  }
};

registerExternalDiagrams([drakonPlugin]);

export default drakonPlugin;