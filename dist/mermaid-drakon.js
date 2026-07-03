import { registerExternalDiagrams as X } from "mermaid";
class T {
  async parse(o) {
    try {
      const n = o.trim().split(`
`).filter((g) => g.trim() !== ""), t = [], e = [];
      let d = null, a = null, c = null;
      const f = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      for (const g of n) {
        const s = g.trim();
        if (!s || s === "drakon") continue;
        if (s.startsWith("Начало:")) {
          const h = this._parseNode(s, "start"), i = h.id || f();
          t.push({ ...h, id: i, width: 160, height: 60 }), d = i, a = i;
          continue;
        }
        if (s.startsWith("Конец:")) {
          const h = this._parseNode(s, "end"), i = h.id || f();
          t.push({ ...h, id: i, width: 160, height: 60 }), d = i, a = i;
          continue;
        }
        if (s.startsWith("Вопрос:")) {
          const h = this._parseQuestionNode(s), i = h.id || f();
          t.push({ ...h, id: i, width: 120, height: 60 }), d = i, a = i, c = i;
          continue;
        }
        if (s.startsWith("Действие:")) {
          const h = this._parseNode(s, "action"), i = h.id || f();
          t.push({ ...h, id: i, width: 160, height: 60 }), d = i, a && a !== i && e.push({ from: a, to: i }), a = i;
          continue;
        }
        if (s.startsWith("Ввод/Вывод:")) {
          const h = this._parseNode(s, "io"), i = h.id || f();
          t.push({ ...h, id: i, width: 160, height: 60 }), d = i, a && a !== i && e.push({ from: a, to: i }), a = i;
          continue;
        }
        if ((s.startsWith("Да:") || s.startsWith("Нет:")) && s.includes("->")) {
          const h = s.startsWith("Да:") ? "Да" : "Нет";
          let m = s.substring(s.indexOf(":") + 1).trim().split("->")[0].trim().replace(/^"|"$/g, "");
          m.startsWith('"') && m.endsWith('"') && (m = m.substring(1, m.length - 1));
          const x = f();
          t.push({
            id: x,
            type: "action",
            text: m,
            width: 160,
            height: 60
          }), c && e.push({ from: c, to: x, label: h }), a = x;
          continue;
        }
        if (s.startsWith('"') && s.endsWith('"')) {
          const h = s.substring(1, s.length - 1), i = f();
          t.push({
            id: i,
            type: "action",
            text: h,
            width: 160,
            height: 60
          }), a && a !== i && e.push({ from: a, to: i }), a = i;
          continue;
        }
        if (s.includes("->")) {
          const h = s.split("->");
          if (h.length >= 2) {
            const i = h[0].trim(), l = h[1].trim(), p = i.match(/^([^\s:]+)/), m = l.match(/^([^\s:]+)/);
            if (p && m) {
              const x = p[1], w = m[1], y = t.find((k) => k.id === x), v = t.find((k) => k.id === w);
              y && v && (e.push({ from: x, to: w }), a = w);
            }
          }
          continue;
        }
        const u = f();
        t.push({
          id: u,
          type: "action",
          text: s.replace(/^"|"$/g, ""),
          width: 160,
          height: 60
        }), a && a !== u && e.push({ from: a, to: u }), a = u;
      }
      return t.some((g) => g.type === "start") || t.unshift({
        id: f(),
        type: "start",
        text: "Начало",
        width: 160,
        height: 60
      }), t.some((g) => g.type === "end") || t.push({
        id: f(),
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
    } catch (n) {
      return {
        ok: !1,
        error: `Failed to parse DRAKON diagram: ${n.message}`
      };
    }
  }
  _parseNode(o, n) {
    const e = o.split(":")[1].trim(), [d, a] = this._splitIdAndText(e);
    return {
      id: d || "",
      type: n,
      text: a || ""
    };
  }
  _parseQuestionNode(o) {
    const t = o.split(":")[1].trim(), [e, d] = this._splitIdAndText(t);
    return {
      id: e || "",
      type: "question",
      text: d || ""
    };
  }
  _splitIdAndText(o) {
    const n = o.replace(/^"|"$/g, ""), t = n.indexOf(" ");
    return t === -1 ? [n, ""] : [
      n.substring(0, t),
      n.substring(t + 1).replace(/^"|"$/g, "")
    ];
  }
}
const _ = new T();
function O(r, o, n) {
  if (!r || r.length === 0)
    return { ok: !1, error: "f_svgBuilder_Build: no nodes provided" };
  const t = (n == null ? void 0 : n.width) || 400, e = (n == null ? void 0 : n.height) || 300, d = [], a = [];
  a.push(
    "<defs>",
    '  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">',
    '    <polygon points="0 0, 10 3.5, 0 7" fill="#000"/>',
    "  </marker>",
    "</defs>"
  );
  const c = new Map(r.map((s) => [s.id, s]));
  for (const s of o) {
    const u = c.get(s.from), h = c.get(s.to);
    if (!u || !h) continue;
    const i = u.x || 0, l = u.y || 0, p = u.width || 160, m = u.height || 60, x = h.x || 0, w = h.y || 0, y = h.width || 160, v = h.height || 60, k = i + p / 2, S = l + m / 2, W = x + y / 2, A = w + v / 2, M = N(k, S, W, A);
    d.push(`<path d="${M}" stroke="#000" stroke-width="2" fill="none" marker-end="url(#arrowhead)" />`);
  }
  const f = [];
  for (const s of r) {
    const u = s.x || 0, h = s.y || 0, i = s.width || 160, l = s.height || 60, p = P(s, u, h, i, l);
    f.push(p);
  }
  return {
    ok: !0,
    value: {
      svgString: [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${e}">`,
        a.join(`
`),
        ...d,
        ...f,
        "</svg>"
      ].join(`
`),
      width: t,
      height: e
    }
  };
}
function N(r, o, n, t) {
  const e = [];
  return Math.abs(n - r) < Math.abs(t - o) ? (e.push(`M ${r} ${o}`), e.push(`L ${r} ${t}`), e.push(`L ${n} ${t}`)) : (e.push(`M ${r} ${o}`), e.push(`L ${n} ${o}`), e.push(`L ${n} ${t}`)), e.join(" ");
}
function P(r, o, n, t, e) {
  const d = C(r.type), a = r.text || "";
  return `<g transform="translate(${o}, ${n})">
    ${d}
    <text x="${t / 2}" y="${e / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="14" fill="#000">${a}</text>
  </g>`;
}
function C(r) {
  switch (r) {
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
const D = {
  horizontalSpacing: 50,
  verticalSpacing: 80,
  mainAxisX: 200,
  branchOffset: 200
};
function I(r, o, n = {}) {
  const t = { ...D, ...n };
  if (!r || r.length === 0)
    return { ok: !1, error: "f_layout_Calculate: no nodes provided" };
  const e = L(r);
  if (!e.ok)
    return e;
  const d = e.value, a = B(r, o), c = [], f = b(
    d.id,
    r,
    o,
    a,
    0,
    t.mainAxisX,
    c,
    t
  ), g = c.reduce((s, u) => Math.max(s, (u.y || 0) + (u.height || 0)), f);
  return {
    ok: !0,
    value: {
      nodes: c,
      width: t.mainAxisX + t.branchOffset * 2,
      height: g + t.verticalSpacing
    }
  };
}
function L(r) {
  const o = r.filter((n) => n.type === "start");
  return o.length === 0 ? { ok: !1, error: "f_node_GetStart: no start node found" } : o.length > 1 ? { ok: !1, error: "f_node_GetStart: multiple start nodes found" } : { ok: !0, value: o[0] };
}
function B(r, o) {
  const n = /* @__PURE__ */ new Map();
  for (const t of r)
    n.set(t.id, []);
  for (const t of o) {
    const e = n.get(t.from) || [];
    e.push(t.to), n.set(t.from, e);
  }
  return n;
}
function b(r, o, n, t, e, d, a, c) {
  const f = o.find((l) => l.id === r);
  if (!f)
    return e;
  a.push({
    ...f,
    x: d,
    y: e,
    width: f.type === "question" ? 120 : 160,
    height: 60
  });
  const g = f.type, s = f.height || 60;
  if (g !== "question") {
    const l = n.filter((p) => p.from === r);
    if (l.length > 0) {
      const p = l[0].to;
      return b(
        p,
        o,
        n,
        t,
        e + s + c.verticalSpacing,
        d,
        a,
        c
      );
    }
    return e;
  }
  const u = n.find(
    (l) => l.from === r && l.label === "Да"
  ), h = n.find(
    (l) => l.from === r && l.label === "Нет"
  );
  let i = e;
  if (u) {
    const l = c.mainAxisX + c.branchOffset, p = e + s;
    a.push({
      id: `${r}_yes_branch_return`,
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
        n,
        t,
        p,
        l,
        c.mainAxisX,
        c,
        a
      )
    );
  }
  if (h) {
    const l = c.mainAxisX - c.branchOffset, p = e + s;
    a.push({
      id: `${r}_no_branch_return`,
      type: "action",
      text: "",
      x: c.mainAxisX,
      y: e + c.verticalSpacing * 2 + 50,
      width: 1,
      height: 1
    }), i = Math.max(
      i,
      $(
        h.to,
        o,
        n,
        t,
        p,
        l,
        c.mainAxisX,
        c,
        a
      )
    );
  }
  return i;
}
function $(r, o, n, t, e, d, a, c, f) {
  const g = o.find((h) => h.id === r);
  if (!g)
    return e;
  const s = g.height || 60;
  if (f.push({
    ...g,
    x: d,
    y: e,
    width: g.type === "question" ? 120 : 160,
    height: s
  }), g.type === "question")
    return b(
      r,
      o,
      n,
      t,
      e,
      d,
      f,
      c
    );
  const u = n.filter((h) => h.from === r);
  if (u.length > 0) {
    const h = u[0].to;
    return $(
      h,
      o,
      n,
      t,
      e + s + c.verticalSpacing,
      d,
      a,
      c,
      f
    );
  }
  return e + s;
}
const q = {
  id: "drakon",
  detector: (r) => /^\s*drakon\b/.test(r),
  loader: () => ({
    parse: async (r) => {
      const o = await _.parse(r);
      if (!o.ok)
        throw new Error(o.error);
      return o.value.diagram;
    },
    renderer: {
      draw: async (r, o) => {
        const n = o, t = I(n.nodes || [], n.edges || []);
        if (!t.ok) return `<svg><text y="20">${t.error}</text></svg>`;
        const e = O(t.value.nodes, t.value.edges, {
          width: t.value.width,
          height: t.value.height
        });
        return e.ok ? e.value.svgString : `<svg><text y="20">${e.error}</text></svg>`;
      }
    }
  })
};
X([q]);
export {
  q as default
};
