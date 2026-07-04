import { registerExternalDiagrams } from 'mermaid';
import { drakonParser } from './parser/drakonParser';
import { f_svgBuilder_Build } from './svgBuilder';

interface DrakonNode {
  id: string;
  type: string;
  text: string;
  width?: number;
  height?: number;
}

interface DrakonDiagram {
  nodes: DrakonNode[];
  clear: () => void;
}

const drakonDiagram: DrakonDiagram = {
  nodes: [],
  clear: () => { drakonDiagram.nodes = []; }
};

export const drakonPlugin = {
  id: 'drakon',
  detector: (text: string) => /^\s*drakon\b/.test(text),
  loader: () => ({
    id: 'drakon',
    diagram: {
      db: {
        nodes: drakonDiagram.nodes,
        clear: drakonDiagram.clear,
        getAccTitle: () => '',
        getAccDescription: () => '',
        // The binding functions that Mermaid expects
        bindFunctions: () => {
          /* No specific binding functions needed for DRAKON diagrams */
        }
      },
      parser: {
        parser: { yy: {} },
        parse: async (text: string) => {
          const result = await drakonParser.parse(text);
          if (result.ok && result.value) {
            drakonDiagram.nodes = result.value.nodes || [];
            return { ok: true, value: { diagram: { nodes: drakonDiagram.nodes } } };
          }
          return { ok: false, error: result.error };
        }
      },
      renderer: {
        draw: (text: string, id: string, version: string, diagObj: any) => {
          const nodes = diagObj?.db?.nodes || [];
          const container = document.getElementById(id);
          if (!container) return;
          
          const height = Math.max(200, nodes.length * 80);
          const svg = f_svgBuilder_Build(nodes, [], { width: 400, height });
          container.innerHTML = svg.ok ? svg.value.svgString : '<svg><text>Error</text></svg>';
        }
      }
    }
  })
};

registerExternalDiagrams([drakonPlugin], { lazyLoad: false });

export default drakonPlugin;