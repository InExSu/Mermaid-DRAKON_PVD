import { registerExternalDiagrams as W } from "mermaid";
class q {
  async parse(t) {
    try {
      const n = t.trim().split(`
`).filter((u) => u.trim() !== ""), e = [], r = [];
      let f = null, s = null, h = null;
      const c = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      for (const u of n) {
        const i = u.trim();
        if (!i || i === "drakon") continue;
        if (i.startsWith("Начало:")) {
          const d = this._parseNode(i, "start"), a = d.id || c();
          e.push({ ...d, id: a, width: 160, height: 60 }), f = a, s = a;
          continue;
        }
        if (i.startsWith("Конец:")) {
          const d = this._parseNode(i, "end"), a = d.id || c();
          e.push({ ...d, id: a, width: 160, height: 60 }), f = a, s = a;
          continue;
        }
        if (i.startsWith("Вопрос:")) {
          const d = this._parseQuestionNode(i), a = d.id || c();
          e.push({ ...d, id: a, width: 120, height: 60 }), f = a, s = a, h = a;
          continue;
        }
        if (i.startsWith("Действие:")) {
          const d = this._parseNode(i, "action"), a = d.id || c();
          e.push({ ...d, id: a, width: 160, height: 60 }), f = a, s && s !== a && r.push({ from: s, to: a }), s = a;
          continue;
        }
        if (i.startsWith("Ввод/Вывод:")) {
          const d = this._parseNode(i, "io"), a = d.id || c();
          e.push({ ...d, id: a, width: 160, height: 60 }), f = a, s && s !== a && r.push({ from: s, to: a }), s = a;
          continue;
        }
        if ((i.startsWith("Да:") || i.startsWith("Нет:")) && i.includes("->")) {
          const d = i.startsWith("Да:") ? "Да" : "Нет";
          let m = i.substring(i.indexOf(":") + 1).trim().split("->")[0].trim().replace(/^"|"$/g, "");
          m.startsWith('"') && m.endsWith('"') && (m = m.substring(1, m.length - 1));
          const x = c();
          e.push({
            id: x,
            type: "action",
            text: m,
            width: 160,
            height: 60
          }), h && r.push({ from: h, to: x, label: d }), s = x;
          continue;
        }
        if (i.startsWith('"') && i.endsWith('"')) {
          const d = i.substring(1, i.length - 1), a = c();
          e.push({
            id: a,
            type: "action",
            text: d,
            width: 160,
            height: 60
          }), s && s !== a && r.push({ from: s, to: a }), s = a;
          continue;
        }
        if (i.includes("->")) {
          const d = i.split("->");
          if (d.length >= 2) {
            const a = d[0].trim(), g = d[1].trim(), p = a.match(/^([^\s:]+)/), m = g.match(/^([^\s:]+)/);
            if (p && m) {
              const x = p[1], _ = m[1], k = e.find((w) => w.id === x), y = e.find((w) => w.id === _);
              k && y && (r.push({ from: x, to: _ }), s = _);
            }
          }
          continue;
        }
        const l = c();
        e.push({
          id: l,
          type: "action",
          text: i.replace(/^"|"$/g, ""),
          width: 160,
          height: 60
        }), s && s !== l && r.push({ from: s, to: l }), s = l;
      }
      return e.some((u) => u.type === "start") || e.unshift({
        id: c(),
        type: "start",
        text: "Начало",
        width: 160,
        height: 60
      }), e.some((u) => u.type === "end") || e.push({
        id: c(),
        type: "end",
        text: "Конец",
        width: 160,
        height: 60
      }), {
        ok: !0,
        value: {
          diagram: {
            nodes: e,
            edges: r
          }
        }
      };
    } catch (n) {
      return {
        ok: !1,
        error: `Failed to parse DRAKON diagram: ${n.message}`
      };
    }
  }
  _parseNode(t, n) {
    const r = t.split(":")[1].trim(), [f, s] = this._splitIdAndText(r);
    return {
      id: f || "",
      type: n,
      text: s || ""
    };
  }
  _parseQuestionNode(t) {
    const e = t.split(":")[1].trim(), [r, f] = this._splitIdAndText(e);
    return {
      id: r || "",
      type: "question",
      text: f || ""
    };
  }
  _splitIdAndText(t) {
    const n = t.replace(/^"|"$/g, ""), e = n.indexOf(" ");
    return e === -1 ? [n, ""] : [
      n.substring(0, e),
      n.substring(e + 1).replace(/^"|"$/g, "")
    ];
  }
}
const b = new q();
function D(o, t, n) {
  if (!o || o.length === 0)
    return { ok: !1, error: "f_svgBuilder_Build: no nodes provided" };
  const e = (n == null ? void 0 : n.width) || 400, r = (n == null ? void 0 : n.height) || 300, f = [], s = [];
  s.push(
    "<defs>",
    '  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">',
    '    <polygon points="0 0, 10 3.5, 0 7" fill="#000"/>',
    "  </marker>",
    "</defs>"
  );
  const h = new Map(o.map((i) => [i.id, i]));
  for (const i of t) {
    const l = h.get(i.from), d = h.get(i.to);
    if (!l || !d) continue;
    const a = l.x || 0, g = l.y || 0, p = l.width || 160, m = l.height || 60, x = d.x || 0, _ = d.y || 0, k = d.width || 160, y = d.height || 60, w = a + p / 2, A = g + m / 2, S = x + k / 2, M = _ + y / 2, T = X(w, A, S, M);
    f.push(`<path d="${T}" stroke="#000" stroke-width="2" fill="none" marker-end="url(#arrowhead)" />`);
  }
  const c = [];
  for (const i of o) {
    const l = i.x || 0, d = i.y || 0, a = i.width || 160, g = i.height || 60, p = C(i, l, d, a, g);
    c.push(p);
  }
  return {
    ok: !0,
    value: {
      svgString: [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${e} ${r}">`,
        s.join(`
`),
        ...f,
        ...c,
        "</svg>"
      ].join(`
`),
      width: e,
      height: r
    }
  };
}
function X(o, t, n, e) {
  const r = [];
  return Math.abs(n - o) < Math.abs(e - t) ? (r.push(`M ${o} ${t}`), r.push(`L ${o} ${e}`), r.push(`L ${n} ${e}`)) : (r.push(`M ${o} ${t}`), r.push(`L ${n} ${t}`), r.push(`L ${n} ${e}`)), r.join(" ");
}
function C(o, t, n, e, r) {
  const f = G(o.type), s = o.text || "";
  return `<g transform="translate(${t}, ${n})">
    ${f}
    <text x="${e / 2}" y="${r / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="14" fill="#000">${s}</text>
  </g>`;
}
function G(o) {
  switch (o) {
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
const L = {
  horizontalSpacing: 50,
  verticalSpacing: 80,
  mainAxisX: 200,
  branchOffset: 200
};
function N(o, t, n = {}) {
  const e = { ...L, ...n };
  if (!o || o.length === 0)
    return { ok: !1, error: "f_layout_Calculate: no nodes provided" };
  const r = O(o);
  if (!r.ok)
    return r;
  const f = r.value, s = E(o, t), h = [], c = $(
    f.id,
    o,
    t,
    s,
    0,
    e.mainAxisX,
    h,
    e
  ), u = h.reduce((i, l) => Math.max(i, (l.y || 0) + (l.height || 0)), c);
  return {
    ok: !0,
    value: {
      nodes: h,
      width: e.mainAxisX + e.branchOffset * 2,
      height: u + e.verticalSpacing
    }
  };
}
function O(o) {
  const t = o.filter((n) => n.type === "start");
  return t.length === 0 ? { ok: !1, error: "f_node_GetStart: no start node found" } : t.length > 1 ? { ok: !1, error: "f_node_GetStart: multiple start nodes found" } : { ok: !0, value: t[0] };
}
function E(o, t) {
  const n = /* @__PURE__ */ new Map();
  for (const e of o)
    n.set(e.id, []);
  for (const e of t) {
    const r = n.get(e.from) || [];
    r.push(e.to), n.set(e.from, r);
  }
  return n;
}
function $(o, t, n, e, r, f, s, h) {
  const c = t.find((g) => g.id === o);
  if (!c)
    return r;
  s.push({
    ...c,
    x: f,
    y: r,
    width: c.type === "question" ? 120 : 160,
    height: 60
  });
  const u = c.type, i = c.height || 60;
  if (u !== "question") {
    const g = n.filter((p) => p.from === o);
    if (g.length > 0) {
      const p = g[0].to;
      return $(
        p,
        t,
        n,
        e,
        r + i + h.verticalSpacing,
        f,
        s,
        h
      );
    }
    return r;
  }
  const l = n.find(
    (g) => g.from === o && g.label === "Да"
  ), d = n.find(
    (g) => g.from === o && g.label === "Нет"
  );
  let a = r;
  if (l) {
    const g = h.mainAxisX + h.branchOffset, p = r + i;
    s.push({
      id: `${o}_yes_branch_return`,
      type: "action",
      text: "",
      x: h.mainAxisX,
      y: p + h.verticalSpacing * 2,
      width: 1,
      height: 1
    }), a = Math.max(
      a,
      v(
        l.to,
        t,
        n,
        e,
        p,
        g,
        h.mainAxisX,
        h,
        s
      )
    );
  }
  if (d) {
    const g = h.mainAxisX - h.branchOffset, p = r + i;
    s.push({
      id: `${o}_no_branch_return`,
      type: "action",
      text: "",
      x: h.mainAxisX,
      y: r + h.verticalSpacing * 2 + 50,
      width: 1,
      height: 1
    }), a = Math.max(
      a,
      v(
        d.to,
        t,
        n,
        e,
        p,
        g,
        h.mainAxisX,
        h,
        s
      )
    );
  }
  return a;
}
function v(o, t, n, e, r, f, s, h, c) {
  const u = t.find((d) => d.id === o);
  if (!u)
    return r;
  const i = u.height || 60;
  if (c.push({
    ...u,
    x: f,
    y: r,
    width: u.type === "question" ? 120 : 160,
    height: i
  }), u.type === "question")
    return $(
      o,
      t,
      n,
      e,
      r,
      f,
      c,
      h
    );
  const l = n.filter((d) => d.from === o);
  if (l.length > 0) {
    const d = l[0].to;
    return v(
      d,
      t,
      n,
      e,
      r + i + h.verticalSpacing,
      f,
      s,
      h,
      c
    );
  }
  return r + i;
}
class P {
  constructor() {
    this.a_nodes = /* @__PURE__ */ new Map(), this.a_edges = [];
  }
  f_node_Add(t) {
    return !t || !t.id || !t.type ? { ok: !1, error: "f_node_Add: missing required properties in node" } : ["start", "end", "question", "action", "io"].includes(t.type) ? this.a_nodes.has(t.id) ? { ok: !1, error: `f_node_Add: node with id "${t.id}" already exists` } : (this.a_nodes.set(t.id, t), { ok: !0, value: void 0 }) : { ok: !1, error: `f_node_Add: invalid type "${t.type}"` };
  }
  f_edge_Add(t) {
    if (!t || !t.from || !t.to)
      return { ok: !1, error: "f_edge_Add: missing from or to in edge" };
    const n = this.a_nodes.has(t.from), e = this.a_nodes.has(t.to);
    return !n || !e ? { ok: !1, error: `f_edge_Add: node not found (from: ${t.from}, to: ${t.to})` } : (this.a_edges.push(t), { ok: !0, value: void 0 });
  }
  f_nodes_Get() {
    return Array.from(this.a_nodes.values());
  }
  f_edges_Get() {
    return [...this.a_edges];
  }
  f_node_Start_Get() {
    const t = this.f_nodes_Get().filter((n) => n.type === "start");
    return t.length === 0 ? { ok: !1, error: "f_node_Start_Get: no start node found" } : t.length > 1 ? { ok: !1, error: "f_node_Start_Get: multiple start nodes found" } : { ok: !0, value: t[0] };
  }
  f_validate() {
    const t = this.f_nodes_Get(), n = t.filter((f) => f.type === "start").length;
    if (n !== 1)
      return { ok: !1, error: `f_validate: expected 1 start node, got ${n}` };
    const e = t.filter((f) => f.type === "end").length;
    if (e !== 1)
      return { ok: !1, error: `f_validate: expected 1 end node, got ${e}` };
    const r = t.filter((f) => f.type === "question");
    for (const f of r) {
      const s = this.a_edges.filter(
        (c) => c.from === f.id && c.label === "Да"
      ), h = this.a_edges.filter(
        (c) => c.from === f.id && c.label === "Нет"
      );
      if (s.length !== 1)
        return { ok: !1, error: `f_validate: question "${f.id}" missing Да edge` };
      if (h.length !== 1)
        return { ok: !1, error: `f_validate: question "${f.id}" missing Нет edge` };
    }
    return this.f_hasCycles() ? { ok: !1, error: "f_validate: diagram contains cycles" } : { ok: !0, value: !0 };
  }
  f_hasCycles() {
    const t = /* @__PURE__ */ new Set(), n = /* @__PURE__ */ new Set(), e = (r) => {
      if (n.has(r))
        return !0;
      if (t.has(r))
        return !1;
      t.add(r), n.add(r);
      const f = this.a_edges.filter((s) => s.from === r).map((s) => s.to);
      for (const s of f)
        if (e(s))
          return !0;
      return n.delete(r), !1;
    };
    for (const r of this.f_nodes_Get())
      if (e(r.id))
        return !0;
    return !1;
  }
  f_clear() {
    this.a_nodes.clear(), this.a_edges = [];
  }
}
const B = {
  parse: async (o) => {
    try {
      const t = await b.parse(o);
      if (!t.ok)
        throw new Error(t.error);
      return { diagram: {
        nodes: t.value.diagram.nodes,
        edges: t.value.diagram.edges
      } };
    } catch (t) {
      throw new Error(`Failed to parse DRAKON diagram: ${t.message}`);
    }
  },
  async draw(o, t, n, e) {
    try {
      const { diagram: r } = await b.parse(o), f = new P();
      for (const u of r.nodes)
        f.f_node_Add(u);
      for (const u of r.edges)
        f.f_edge_Add(u);
      const s = f.f_validate();
      if (!s.ok)
        throw new Error(`Diagram validation failed: ${s.error}`);
      const h = N(
        r.nodes,
        r.edges
      );
      if (!h.ok)
        throw new Error(`Layout failed: ${h.error}`);
      const c = D(
        h.value.nodes,
        h.value.edges,
        {
          width: h.value.width,
          height: h.value.height
        }
      );
      if (!c.ok)
        throw new Error(`SVG build failed: ${c.error}`);
      e.innerHTML = c.value.svgString, e.setAttribute("width", String(c.value.width)), e.setAttribute("height", String(c.value.height));
    } catch (r) {
      e.innerHTML = `<text x="50%" y="50%" text-anchor="middle" fill="red" font-size="16">${r.message}</text>`, e.setAttribute("width", "400"), e.setAttribute("height", "100");
    }
  }
}, H = {
  id: "drakon",
  detector: (o) => /^\s*drakon\b/.test(o),
  loader: async () => B
};
W([H]);
export {
  H as default
};
