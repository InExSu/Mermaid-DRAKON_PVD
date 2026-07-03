import { registerExternalDiagrams as X } from "mermaid";
class T {
  async parse(o) {
    try {
      const i = o.trim().split(`
`).filter((g) => g.trim() !== ""), t = [], e = [];
      let f = null, h = null, c = null;
      const d = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      for (const g of i) {
        const n = g.trim();
        if (!n || n === "drakon") continue;
        if (n.startsWith("Начало:")) {
          const a = this._parseNode(n, "start"), s = a.id || d();
          t.push({ ...a, id: s, width: 160, height: 60 }), f = s, h = s;
          continue;
        }
        if (n.startsWith("Конец:")) {
          const a = this._parseNode(n, "end"), s = a.id || d();
          t.push({ ...a, id: s, width: 160, height: 60 }), f = s, h = s;
          continue;
        }
        if (n.startsWith("Вопрос:")) {
          const a = this._parseQuestionNode(n), s = a.id || d();
          t.push({ ...a, id: s, width: 120, height: 60 }), f = s, h = s, c = s;
          continue;
        }
        if (n.startsWith("Действие:")) {
          const a = this._parseNode(n, "action"), s = a.id || d();
          t.push({ ...a, id: s, width: 160, height: 60 }), f = s, h && h !== s && e.push({ from: h, to: s }), h = s;
          continue;
        }
        if (n.startsWith("Ввод/Вывод:")) {
          const a = this._parseNode(n, "io"), s = a.id || d();
          t.push({ ...a, id: s, width: 160, height: 60 }), f = s, h && h !== s && e.push({ from: h, to: s }), h = s;
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
          const a = n.substring(1, n.length - 1), s = d();
          t.push({
            id: s,
            type: "action",
            text: a,
            width: 160,
            height: 60
          }), h && h !== s && e.push({ from: h, to: s }), h = s;
          continue;
        }
        if (n.includes("->")) {
          const a = n.split("->");
          if (a.length >= 2) {
            const s = a[0].trim(), l = a[1].trim(), p = s.match(/^([^\s:]+)/), m = l.match(/^([^\s:]+)/);
            if (p && m) {
              const x = p[1], w = m[1], k = t.find((y) => y.id === x), v = t.find((y) => y.id === w);
              k && v && (e.push({ from: x, to: w }), h = w);
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
    } catch (i) {
      return {
        ok: !1,
        error: `Failed to parse DRAKON diagram: ${i.message}`
      };
    }
  }
  _parseNode(o, i) {
    const e = o.split(":")[1].trim(), [f, h] = this._splitIdAndText(e);
    return {
      id: f || "",
      type: i,
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
    const i = o.replace(/^"|"$/g, ""), t = i.indexOf(" ");
    return t === -1 ? [i, ""] : [
      i.substring(0, t),
      i.substring(t + 1).replace(/^"|"$/g, "")
    ];
  }
}
const _ = new T();
function O(r, o, i) {
  if (!r || r.length === 0)
    return { ok: !1, error: "f_svgBuilder_Build: no nodes provided" };
  const t = (i == null ? void 0 : i.width) || 400, e = (i == null ? void 0 : i.height) || 300, f = [], h = [];
  h.push(
    "<defs>",
    '  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">',
    '    <polygon points="0 0, 10 3.5, 0 7" fill="#000"/>',
    "  </marker>",
    "</defs>"
  );
  const c = new Map(r.map((n) => [n.id, n]));
  for (const n of o) {
    const u = c.get(n.from), a = c.get(n.to);
    if (!u || !a) continue;
    const s = u.x || 0, l = u.y || 0, p = u.width || 160, m = u.height || 60, x = a.x || 0, w = a.y || 0, k = a.width || 160, v = a.height || 60, y = s + p / 2, S = l + m / 2, W = x + k / 2, A = w + v / 2, M = L(y, S, W, A);
    f.push(`<path d="${M}" stroke="#000" stroke-width="2" fill="none" marker-end="url(#arrowhead)" />`);
  }
  const d = [];
  for (const n of r) {
    const u = n.x || 0, a = n.y || 0, s = n.width || 160, l = n.height || 60, p = N(n, u, a, s, l);
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
function L(r, o, i, t) {
  const e = [];
  return Math.abs(i - r) < Math.abs(t - o) ? (e.push(`M ${r} ${o}`), e.push(`L ${r} ${t}`), e.push(`L ${i} ${t}`)) : (e.push(`M ${r} ${o}`), e.push(`L ${i} ${o}`), e.push(`L ${i} ${t}`)), e.join(" ");
}
function N(r, o, i, t, e) {
  const f = P(r.type), h = r.text || "";
  return `<g transform="translate(${o}, ${i})">
    ${f}
    <text x="${t / 2}" y="${e / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="14" fill="#000">${h}</text>
  </g>`;
}
function P(r) {
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
const C = {
  horizontalSpacing: 50,
  verticalSpacing: 80,
  mainAxisX: 200,
  branchOffset: 200
};
function D(r, o, i = {}) {
  const t = { ...C, ...i };
  if (!r || r.length === 0)
    return { ok: !1, error: "f_layout_Calculate: no nodes provided" };
  const e = I(r);
  if (!e.ok)
    return e;
  const f = e.value, h = B(r, o), c = [], d = b(
    f.id,
    r,
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
function I(r) {
  const o = r.filter((i) => i.type === "start");
  return o.length === 0 ? { ok: !1, error: "f_node_GetStart: no start node found" } : o.length > 1 ? { ok: !1, error: "f_node_GetStart: multiple start nodes found" } : { ok: !0, value: o[0] };
}
function B(r, o) {
  const i = /* @__PURE__ */ new Map();
  for (const t of r)
    i.set(t.id, []);
  for (const t of o) {
    const e = i.get(t.from) || [];
    e.push(t.to), i.set(t.from, e);
  }
  return i;
}
function b(r, o, i, t, e, f, h, c) {
  const d = o.find((l) => l.id === r);
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
    const l = i.filter((p) => p.from === r);
    if (l.length > 0) {
      const p = l[0].to;
      return b(
        p,
        o,
        i,
        t,
        e + n + c.verticalSpacing,
        f,
        h,
        c
      );
    }
    return e;
  }
  const u = i.find(
    (l) => l.from === r && l.label === "Да"
  ), a = i.find(
    (l) => l.from === r && l.label === "Нет"
  );
  let s = e;
  if (u) {
    const l = c.mainAxisX + c.branchOffset, p = e + n;
    h.push({
      id: `${r}_yes_branch_return`,
      type: "action",
      text: "",
      x: c.mainAxisX,
      y: p + c.verticalSpacing * 2,
      width: 1,
      height: 1
    }), s = Math.max(
      s,
      $(
        u.to,
        o,
        i,
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
      id: `${r}_no_branch_return`,
      type: "action",
      text: "",
      x: c.mainAxisX,
      y: e + c.verticalSpacing * 2 + 50,
      width: 1,
      height: 1
    }), s = Math.max(
      s,
      $(
        a.to,
        o,
        i,
        t,
        p,
        l,
        c.mainAxisX,
        c,
        h
      )
    );
  }
  return s;
}
function $(r, o, i, t, e, f, h, c, d) {
  const g = o.find((a) => a.id === r);
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
      r,
      o,
      i,
      t,
      e,
      f,
      d,
      c
    );
  const u = i.filter((a) => a.from === r);
  if (u.length > 0) {
    const a = u[0].to;
    return $(
      a,
      o,
      i,
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
  detector: (r) => /^\s*drakon\b/.test(r),
  loader: () => ({
    parse: async (r) => {
      const o = await _.parse(r);
      if (!o.ok)
        throw new Error(o.error);
      return o.value.diagram;
    },
    draw: async (r, o, i) => {
      const t = o, e = D(t.nodes || [], t.edges || []);
      if (!e.ok) return '<svg><text y="20">Layout Error</text></svg>';
      const f = O(e.value.nodes, e.value.edges, {
        width: e.value.width,
        height: e.value.height
      });
      return f.ok ? f.value.svgString : '<svg><text y="20">Render Error</text></svg>';
    }
  })
};
X([q]);
export {
  q as default
};
