import { registerExternalDiagrams as X } from "mermaid";
class T {
  async parse(o) {
    try {
      const r = o.trim().split(`
`).filter((g) => g.trim() !== ""), t = [], e = [];
      let f = null, h = null, c = null;
      const d = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      for (const g of r) {
        const n = g.trim();
        if (!n || n === "drakon") continue;
        if (n.startsWith("Начало:")) {
          const a = this._parseNode(n, "start"), i = a.id || d();
          t.push({ ...a, id: i, width: 160, height: 60 }), f = i, h = i;
          continue;
        }
        if (n.startsWith("Конец:")) {
          const a = this._parseNode(n, "end"), i = a.id || d();
          t.push({ ...a, id: i, width: 160, height: 60 }), f = i, h = i;
          continue;
        }
        if (n.startsWith("Вопрос:")) {
          const a = this._parseQuestionNode(n), i = a.id || d();
          t.push({ ...a, id: i, width: 120, height: 60 }), f = i, h = i, c = i;
          continue;
        }
        if (n.startsWith("Действие:")) {
          const a = this._parseNode(n, "action"), i = a.id || d();
          t.push({ ...a, id: i, width: 160, height: 60 }), f = i, h && h !== i && e.push({ from: h, to: i }), h = i;
          continue;
        }
        if (n.startsWith("Ввод/Вывод:")) {
          const a = this._parseNode(n, "io"), i = a.id || d();
          t.push({ ...a, id: i, width: 160, height: 60 }), f = i, h && h !== i && e.push({ from: h, to: i }), h = i;
          continue;
        }
        if ((n.startsWith("Да:") || n.startsWith("Нет:")) && n.includes("->")) {
          const a = n.startsWith("Да:") ? "Да" : "Нет";
          let m = n.substring(n.indexOf(":") + 1).trim().split("->")[0].trim().replace(/^"|"$/g, "");
          m.startsWith('"') && m.endsWith('"') && (m = m.substring(1, m.length - 1));
          const x = d();
          t.push({
            id: x,
            type: "action",
            text: m,
            width: 160,
            height: 60
          }), c && e.push({ from: c, to: x, label: a }), h = x;
          continue;
        }
        if (n.startsWith('"') && n.endsWith('"')) {
          const a = n.substring(1, n.length - 1), i = d();
          t.push({
            id: i,
            type: "action",
            text: a,
            width: 160,
            height: 60
          }), h && h !== i && e.push({ from: h, to: i }), h = i;
          continue;
        }
        if (n.includes("->")) {
          const a = n.split("->");
          if (a.length >= 2) {
            const i = a[0].trim(), l = a[1].trim(), p = i.match(/^([^\s:]+)/), m = l.match(/^([^\s:]+)/);
            if (p && m) {
              const x = p[1], w = m[1], y = t.find((k) => k.id === x), v = t.find((k) => k.id === w);
              y && v && (e.push({ from: x, to: w }), h = w);
            }
          }
          continue;
        }
        const u = d();
        t.push({
          id: u,
          type: "action",
          text: n.replace(/^"|"$/g, ""),
          width: 160,
          height: 60
        }), h && h !== u && e.push({ from: h, to: u }), h = u;
      }
      return t.some((g) => g.type === "start") || t.unshift({
        id: d(),
        type: "start",
        text: "Начало",
        width: 160,
        height: 60
      }), t.some((g) => g.type === "end") || t.push({
        id: d(),
        type: "end",
        text: "Конец",
        width: 160,
        height: 60
      }), {
        ok: !0,
        value: {
          diagram: {
            nodes: t,
            edges: e
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
    const e = o.split(":")[1].trim(), [f, h] = this._splitIdAndText(e);
    return {
      id: f || "",
      type: r,
      text: h || ""
    };
  }
  _parseQuestionNode(o) {
    const t = o.split(":")[1].trim(), [e, f] = this._splitIdAndText(t);
    return {
      id: e || "",
      type: "question",
      text: f || ""
    };
  }
  _splitIdAndText(o) {
    const r = o.replace(/^"|"$/g, ""), t = r.indexOf(" ");
    return t === -1 ? [r, ""] : [
      r.substring(0, t),
      r.substring(t + 1).replace(/^"|"$/g, "")
    ];
  }
}
const _ = new T();
function O(s, o, r) {
  if (!s || s.length === 0)
    return { ok: !1, error: "f_svgBuilder_Build: no nodes provided" };
  const t = (r == null ? void 0 : r.width) || 400, e = (r == null ? void 0 : r.height) || 300, f = [], h = [];
  h.push(
    "<defs>",
    '  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">',
    '    <polygon points="0 0, 10 3.5, 0 7" fill="#000"/>',
    "  </marker>",
    "</defs>"
  );
  const c = new Map(s.map((n) => [n.id, n]));
  for (const n of o) {
    const u = c.get(n.from), a = c.get(n.to);
    if (!u || !a) continue;
    const i = u.x || 0, l = u.y || 0, p = u.width || 160, m = u.height || 60, x = a.x || 0, w = a.y || 0, y = a.width || 160, v = a.height || 60, k = i + p / 2, S = l + m / 2, W = x + y / 2, A = w + v / 2, M = D(k, S, W, A);
    f.push(`<path d="${M}" stroke="#000" stroke-width="2" fill="none" marker-end="url(#arrowhead)" />`);
  }
  const d = [];
  for (const n of s) {
    const u = n.x || 0, a = n.y || 0, i = n.width || 160, l = n.height || 60, p = N(n, u, a, i, l);
    d.push(p);
  }
  return {
    ok: !0,
    value: {
      svgString: [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${e}">`,
        h.join(`
`),
        ...f,
        ...d,
        "</svg>"
      ].join(`
`),
      width: t,
      height: e
    }
  };
}
function D(s, o, r, t) {
  const e = [];
  return Math.abs(r - s) < Math.abs(t - o) ? (e.push(`M ${s} ${o}`), e.push(`L ${s} ${t}`), e.push(`L ${r} ${t}`)) : (e.push(`M ${s} ${o}`), e.push(`L ${r} ${o}`), e.push(`L ${r} ${t}`)), e.join(" ");
}
function N(s, o, r, t, e) {
  const f = P(s.type), h = s.text || "";
  return `<g transform="translate(${o}, ${r})">
    ${f}
    <text x="${t / 2}" y="${e / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="14" fill="#000">${h}</text>
  </g>`;
}
function P(s) {
  switch (s) {
    case "start":
    case "end":
      return '<ellipse cx="80" cy="30" rx="80" ry="30" fill="#fff" stroke="#000" stroke-width="2" />';
    case "question":
      return '<polygon points="60,0 120,30 60,60 0,30" fill="#fff" stroke="#000" stroke-width="2" />';
    case "action":
      return '<rect x="0" y="0" width="160" height="60" rx="5" ry="5" fill="#fff" stroke="#000" stroke-width="2" />';
    case "io":
      return '<polygon points="40,0 140,0 160,30 60,30" fill="#fff" stroke="#000" stroke-width="2" />';
    default:
      return '<rect x="0" y="0" width="160" height="60" fill="#fff" stroke="#000" stroke-width="2" />';
  }
}
const C = {
  horizontalSpacing: 50,
  verticalSpacing: 80,
  mainAxisX: 200,
  branchOffset: 200
};
function I(s, o, r = {}) {
  const t = { ...C, ...r };
  if (!s || s.length === 0)
    return { ok: !1, error: "f_layout_Calculate: no nodes provided" };
  const e = L(s);
  if (!e.ok)
    return e;
  const f = e.value, h = B(s, o), c = [], d = b(
    f.id,
    s,
    o,
    h,
    0,
    t.mainAxisX,
    c,
    t
  ), g = c.reduce((n, u) => Math.max(n, (u.y || 0) + (u.height || 0)), d);
  return {
    ok: !0,
    value: {
      nodes: c,
      width: t.mainAxisX + t.branchOffset * 2,
      height: g + t.verticalSpacing
    }
  };
}
function L(s) {
  const o = s.filter((r) => r.type === "start");
  return o.length === 0 ? { ok: !1, error: "f_node_GetStart: no start node found" } : o.length > 1 ? { ok: !1, error: "f_node_GetStart: multiple start nodes found" } : { ok: !0, value: o[0] };
}
function B(s, o) {
  const r = /* @__PURE__ */ new Map();
  for (const t of s)
    r.set(t.id, []);
  for (const t of o) {
    const e = r.get(t.from) || [];
    e.push(t.to), r.set(t.from, e);
  }
  return r;
}
function b(s, o, r, t, e, f, h, c) {
  const d = o.find((l) => l.id === s);
  if (!d)
    return e;
  h.push({
    ...d,
    x: f,
    y: e,
    width: d.type === "question" ? 120 : 160,
    height: 60
  });
  const g = d.type, n = d.height || 60;
  if (g !== "question") {
    const l = r.filter((p) => p.from === s);
    if (l.length > 0) {
      const p = l[0].to;
      return b(
        p,
        o,
        r,
        t,
        e + n + c.verticalSpacing,
        f,
        h,
        c
      );
    }
    return e;
  }
  const u = r.find(
    (l) => l.from === s && l.label === "Да"
  ), a = r.find(
    (l) => l.from === s && l.label === "Нет"
  );
  let i = e;
  if (u) {
    const l = c.mainAxisX + c.branchOffset, p = e + n;
    h.push({
      id: `${s}_yes_branch_return`,
      type: "action",
      text: "",
      x: c.mainAxisX,
      y: p + c.verticalSpacing * 2,
      width: 1,
      height: 1
    }), i = Math.max(
      i,
      $(
        u.to,
        o,
        r,
        t,
        p,
        l,
        c.mainAxisX,
        c,
        h
      )
    );
  }
  if (a) {
    const l = c.mainAxisX - c.branchOffset, p = e + n;
    h.push({
      id: `${s}_no_branch_return`,
      type: "action",
      text: "",
      x: c.mainAxisX,
      y: e + c.verticalSpacing * 2 + 50,
      width: 1,
      height: 1
    }), i = Math.max(
      i,
      $(
        a.to,
        o,
        r,
        t,
        p,
        l,
        c.mainAxisX,
        c,
        h
      )
    );
  }
  return i;
}
function $(s, o, r, t, e, f, h, c, d) {
  const g = o.find((a) => a.id === s);
  if (!g)
    return e;
  const n = g.height || 60;
  if (d.push({
    ...g,
    x: f,
    y: e,
    width: g.type === "question" ? 120 : 160,
    height: n
  }), g.type === "question")
    return b(
      s,
      o,
      r,
      t,
      e,
      f,
      d,
      c
    );
  const u = r.filter((a) => a.from === s);
  if (u.length > 0) {
    const a = u[0].to;
    return $(
      a,
      o,
      r,
      t,
      e + n + c.verticalSpacing,
      f,
      h,
      c,
      d
    );
  }
  return e + n;
}
const q = {
  id: "drakon",
  detector: (s) => /^\s*drakon\b/.test(s),
  loader: () => ({
    parse: async (s) => {
      const o = await _.parse(s);
      if (!o.ok)
        throw new Error(o.error);
      return {
        type: "drakonDiagram",
        nodes: o.value.diagram.nodes,
        edges: o.value.diagram.edges
      };
    },
    renderer: {
      // Mermaid вызывает draw для рендеринга
      draw: async (s, o, r) => {
        const t = o, e = I(t.nodes || [], t.edges || []);
        if (!e.ok) return '<text x="50%" y="50%">Error</text>';
        const f = O(e.value.nodes, e.value.edges, {
          width: e.value.width,
          height: e.value.height
        });
        return f.ok ? f.value.svgString : '<text x="50%" y="50%">Render Error</text>';
      }
    }
  })
};
X([q]);
export {
  q as default
};
