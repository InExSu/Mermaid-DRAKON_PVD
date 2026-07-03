import { registerExternalDiagrams } from 'mermaid';
import { drakonParser } from './parser/drakonParser';
import { f_svgBuilder_Build } from './svgBuilder';
import { f_layout_Calculate } from './layoutEngine';
import { DrakonDb } from './drakonDb';

const drakonParserInstance = {
  parse: async (text: string) => {
    try {
      const result = await drakonParser.parse(text);
      
      if (!result.ok) {
        throw new Error(result.error);
      }
      
      // Convert parse result to our internal format
      const diagram: any = {
        nodes: result.value.diagram.nodes,
        edges: result.value.diagram.edges
      };
      
      return { diagram };
    } catch (error: any) {
      throw new Error(`Failed to parse DRAKON diagram: ${error.message}`);
    }
  },
  
  async draw(
    text: string,
    id: string,
    version: string,
    diagram: SVGElement
  ): Promise<void> {
    try {
      const { diagram: drakonDiagram } = await drakonParser.parse(text);
      
      // Validate the diagram structure
      const db = new DrakonDb();
      // Add all nodes
      for (const node of drakonDiagram.nodes) {
        db.f_node_Add(node as any);
      }
      // Add all edges
      for (const edge of drakonDiagram.edges) {
        db.f_edge_Add(edge);
      }
      // Run validation
      const validationResult = db.f_validate();
      if (!validationResult.ok) {
        throw new Error(`Diagram validation failed: ${validationResult.error}`);
      }
      
      // Calculate layout
      const layoutResult = f_layout_Calculate(
        drakonDiagram.nodes,
        drakonDiagram.edges
      );
      
      if (!layoutResult.ok) {
        throw new Error(`Layout failed: ${layoutResult.error}`);
      }
      
      // Build SVG
      const svgResult = f_svgBuilder_Build(
        layoutResult.value.nodes,
        layoutResult.value.edges,
        {
          width: layoutResult.value.width,
          height: layoutResult.value.height
        }
      );
      
      if (!svgResult.ok) {
        throw new Error(`SVG build failed: ${svgResult.error}`);
      }
      
      // Set SVG content
      diagram.innerHTML = svgResult.value.svgString;
      diagram.setAttribute('width', String(svgResult.value.width));
      diagram.setAttribute('height', String(svgResult.value.height));
    } catch (error: any) {
      // Show error in diagram
      diagram.innerHTML = `<text x="50%" y="50%" text-anchor="middle" fill="red" font-size="16">${error.message}</text>`;
      diagram.setAttribute('width', '400');
      diagram.setAttribute('height', '100');
    }
  }
};

const drakonPlugin = {
  id: 'drakon',
  detector: (text: string) => /^\s*drakon\b/.test(text),
  loader: async () => {
    return drakonParserInstance;
  }
};

registerExternalDiagrams([drakonPlugin]);

export default drakonPlugin;