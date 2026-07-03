import { registerExternalDiagrams as _ } from "mermaid";
class I {
  async parse(o) {
    try {
      const r = o.trim().split(`
`).filter((u) => u.trim() !== ""), i = [], d = [];
      let c = null, s = null, g = null;
      const a = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      for (const u of r) {
        const e = u.trim();
        if (!e || e === "drakon") continue;
        if (e.startsWith("Начало:")) {
          const n = this._parseNode(e, "start"), t = n.id || a();
          i.push({ ...n, id: t, width: 160, height: 60 }), c = t, s = t;
          continue;
        }
        if (e.startsWith("Конец:")) {
          const n = this._parseNode(e, "end"), t = n.id || a();
          i.push({ ...n, id: t, width: 160, height: 60 }), c = t, s = t;
          continue;
        }
        if (e.startsWith("Вопрос:")) {
          const n = this._parseQuestionNode(e), t = n.id || a();
          i.push({ ...n, id: t, width: 120, height: 60 }), c = t, s = t, g = t;
          continue;
        }
        if (e.startsWith("Действие:")) {
          const n = this._parseNode(e, "action"), t = n.id || a();
          i.push({ ...n, id: t, width: 160, height: 60 }), c = t, s && s !== t && d.push({ from: s, to: t }), s = t;
          continue;
        }
        if (e.startsWith("Ввод/Вывод:")) {
          const n = this._parseNode(e, "io"), t = n.id || a();
          i.push({ ...n, id: t, width: 160, height: 60 }), c = t, s && s !== t && d.push({ from: s, to: t }), s = t;
          continue;
        }
        if ((e.startsWith("Да:") || e.startsWith("Нет:")) && e.includes("->")) {
          const n = e.startsWith("Да:") ? "Да" : "Нет";
          let h = e.substring(e.indexOf(":") + 1).trim().split("->")[0].trim().replace(/^"|"$/g, "");
          h.startsWith('"') && h.endsWith('"') && (h = h.substring(1, h.length - 1));
          const p = a();
          i.push({
            id: p,
            type: "action",
            text: h,
            width: 160,
            height: 60
          }), g && d.push({ from: g, to: p, label: n }), s = p;
          continue;
        }
        if (e.startsWith('"') && e.endsWith('"')) {
          const n = e.substring(1, e.length - 1), t = a();
          i.push({
            id: t,
            type: "action",
            text: n,
            width: 160,
            height: 60
          }), s && s !== t && d.push({ from: s, to: t }), s = t;
          continue;
        }
        if (e.includes("->")) {
          const n = e.split("->");
          if (n.length >= 2) {
            const t = n[0].trim(), y = n[1].trim(), m = t.match(/^([^\s:]+)/), h = y.match(/^([^\s:]+)/);
            if (m && h) {
              const p = m[1], x = h[1], N = i.find((w) => w.id === p), W = i.find((w) => w.id === x);
              N && W && (d.push({ from: p, to: x }), s = x);
            }
          }
          continue;
        }
        const l = a();
        i.push({
          id: l,
          type: "action",
          text: e.replace(/^"|"$/g, ""),
          width: 160,
          height: 60
        }), s && s !== l && d.push({ from: s, to: l }), s = l;
      }
      return i.some((u) => u.type === "start") || i.unshift({
        id: a(),
        type: "start",
        text: "Начало",
        width: 160,
        height: 60
      }), i.some((u) => u.type === "end") || i.push({
        id: a(),
        type: "end",
        text: "Конец",
        width: 160,
        height: 60
      }), {
        ok: !0,
        value: {
          diagram: {
            nodes: i,
            edges: d
          }
        }
      };
    } catch (r) {
      return {
        ok: !1,
        error: `Failed to parse DRAKON diagram: ${r.message}`
      };
    }
  }
  _parseNode(o, r) {
    const d = o.split(":")[1].trim(), [c, s] = this._splitIdAndText(d);
    return {
      id: c || "",
      type: r,
      text: s || ""
    };
  }
  _parseQuestionNode(o) {
    const i = o.split(":")[1].trim(), [d, c] = this._splitIdAndText(i);
    return {
      id: d || "",
      type: "question",
      text: c || ""
    };
  }
  _splitIdAndText(o) {
    const r = o.replace(/^"|"$/g, ""), i = r.indexOf(" ");
    return i === -1 ? [r, ""] : [
      r.substring(0, i),
      r.substring(i + 1).replace(/^"|"$/g, "")
    ];
  }
}
const b = new I(), k = {
  id: "drakon",
  detector: (f) => /^\s*drakon\b/.test(f),
  loader: async () => ({
    parse: async (f) => {
      const o = await b.parse(f);
      if (!o.ok)
        throw new Error(o.error);
      return {
        type: "drakon",
        nodes: o.value.diagram.nodes,
        edges: o.value.diagram.edges
      };
    }
  })
};
_([k]);
export {
  k as default
};
