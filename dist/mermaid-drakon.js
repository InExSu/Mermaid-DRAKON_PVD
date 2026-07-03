import { registerExternalDiagrams as X } from "mermaid";
class T {
  async parse(i) {
    try {
      const r = i.trim().split(`
`).filter((g) => g.trim() !== ""), t = [], e = [];
      let c = null, s = null, f = null;
      const d = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      for (const g of r) {
        const n = g.trim();
        if (!n || n === "drakon") continue;
        if (n.startsWith("Начало:")) {
          const h = this._parseNode(n, "start"), o = h.id || d();
          t.push({ ...h, id: o, width: 160, height: 60 }), c = o, s = o;
          continue;
        }
        if (n.startsWith("Конец:")) {
          const h = this._parseNode(n, "end"), o = h.id || d();
          t.push({ ...h, id: o, width: 160, height: 60 }), c = o, s = o;
          continue;
        }
        if (n.startsWith("Вопрос:")) {
          const h = this._parseQuestionNode(n), o = h.id || d();
          t.push({ ...h, id: o, width: 120, height: 60 }), c = o, s = o, f = o;
          continue;
        }
        if (n.startsWith("Действие:")) {
          const h = this._parseNode(n, "action"), o = h.id || d();
          t.push({ ...h, id: o, width: 160, height: 60 }), c = o, s && s !== o && e.push({ from: s, to: o }), s = o;
          continue;
        }
        if (n.startsWith("Ввод/Вывод:")) {
          const h = this._parseNode(n, "io"), o = h.id || d();
          t.push({ ...h, id: o, width: 160, height: 60 }), c = o, s && s !== o && e.push({ from: s, to: o }), s = o;
          continue;
        }
        if ((n.startsWith("Да:") || n.startsWith("Нет:")) && n.includes("->")) {
          const h = n.startsWith("Да:") ? "Да" : "Нет";
          let p = n.substring(n.indexOf(":") + 1).trim().split("->")[0].trim().replace(/^"|"$/g, "");
          p.startsWith('"') && p.endsWith('"') && (p = p.substring(1, p.length - 1));
          const x = d();
          t.push({
            id: x,
            type: "action",
            text: p,
            width: 160,
            height: 60
          }), f && e.push({ from: f, to: x, label: h }), s = x;
          continue;
        }
        if (n.startsWith('"') && n.endsWith('"')) {
          const h = n.substring(1, n.length - 1), o = d();
          t.push({
            id: o,
            type: "action",
            text: h,
            width: 160,
            height: 60
          }), s && s !== o && e.push({ from: s, to: o }), s = o;
          continue;
        }
        if (n.includes("->")) {
          const h = n.split("->");
          if (h.length >= 2) {
            const o = h[0].trim(), l = h[1].trim(), m = o.match(/^([^\s:]+)/), p = l.match(/^([^\s:]+)/);
            if (m && p) {
              const x = m[1], w = p[1], k = t.find((y) => y.id === x), v = t.find((y) => y.id === w);
              k && v && (e.push({ from: x, to: w }), s = w);
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
        }), s && s !== u && e.push({ from: s, to: u }), s = u;
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
  _parseNode(i, r) {
    const e = i.split(":")[1].trim(), [c, s] = this._splitIdAndText(e);
    return {
      id: c || "",
      type: r,
      text: s || ""
    };
  }
  _parseQuestionNode(i) {
    const t = i.split(":")[1].trim(), [e, c] = this._splitIdAndText(t);
    return {
      id: e || "",
      type: "question",
      text: c || ""
    };
  }
  _splitIdAndText(i) {
    const r = i.replace(/^"|"$/g, ""), t = r.indexOf(" ");
    return t === -1 ? [r, ""] : [
      r.substring(0, t),
      r.substring(t + 1).replace(/^"|"$/g, "")
    ];
  }
}
const _ = new T();
function O(a, i, r) {
  if (!a || a.length === 0)
    return { ok: !1, error: "f_svgBuilder_Build: no nodes provided" };
  const t = (r == null ? void 0 : r.width) || 400, e = (r == null ? void 0 : r.height) || 300, c = [], s = [];
  s.push(
    "<defs>",
    '  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">',
    '    <polygon points="0 0, 10 3.5, 0 7" fill="#000"/>',
    "  </marker>",
    "</defs>"
  );
  const f = new Map(a.map((n) => [n.id, n]));
  for (const n of i) {
    const u = f.get(n.from), h = f.get(n.to);
    if (!u || !h) continue;
    const o = u.x || 0, l = u.y || 0, m = u.width || 160, p = u.height || 60, x = h.x || 0, w = h.y || 0, k = h.width || 160, v = h.height || 60, y = o + m / 2, S = l + p / 2, W = x + k / 2, A = w + v / 2, M = D(y, S, W, A);
    c.push(`<path d="${M}" stroke="#000" stroke-width="2" fill="none" marker-end="url(#arrowhead)" />`);
  }
  const d = [];
  for (const n of a) {
    const u = n.x || 0, h = n.y || 0, o = n.width || 160, l = n.height || 60, m = L(n, u, h, o, l);
    d.push(m);
  }
  return {
    ok: !0,
    value: {
      svgString: [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${e}">`,
        s.join(`
`),
        ...c,
        ...d,
        "</svg>"
      ].join(`
`),
      width: t,
      height: e
    }
  };
}
function D(a, i, r, t) {
  const e = [];
  return Math.abs(r - a) < Math.abs(t - i) ? (e.push(`M ${a} ${i}`), e.push(`L ${a} ${t}`), e.push(`L ${r} ${t}`)) : (e.push(`M ${a} ${i}`), e.push(`L ${r} ${i}`), e.push(`L ${r} ${t}`)), e.join(" ");
}
function L(a, i, r, t, e) {
  const c = N(a.type), s = a.text || "";
  return `<g transform="translate(${i}, ${r})">
    ${c}
    <text x="${t / 2}" y="${e / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="14" fill="#000">${s}</text>
  </g>`;
}
function N(a) {
  switch (a) {
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
const P = {
  horizontalSpacing: 50,
  verticalSpacing: 80,
  mainAxisX: 200,
  branchOffset: 200
};
function C(a, i, r = {}) {
  const t = { ...P, ...r };
  if (!a || a.length === 0)
    return { ok: !1, error: "f_layout_Calculate: no nodes provided" };
  const e = I(a);
  if (!e.ok)
    return e;
  const c = e.value, s = B(a, i), f = [], d = b(
    c.id,
    a,
    i,
    s,
    0,
    t.mainAxisX,
    f,
    t
  ), g = f.reduce((n, u) => Math.max(n, (u.y || 0) + (u.height || 0)), d);
  return {
    ok: !0,
    value: {
      nodes: f,
      width: t.mainAxisX + t.branchOffset * 2,
      height: g + t.verticalSpacing
    }
  };
}
function I(a) {
  const i = a.filter((r) => r.type === "start");
  return i.length === 0 ? { ok: !1, error: "f_node_GetStart: no start node found" } : i.length > 1 ? { ok: !1, error: "f_node_GetStart: multiple start nodes found" } : { ok: !0, value: i[0] };
}
function B(a, i) {
  const r = /* @__PURE__ */ new Map();
  for (const t of a)
    r.set(t.id, []);
  for (const t of i) {
    const e = r.get(t.from) || [];
    e.push(t.to), r.set(t.from, e);
  }
  return r;
}
function b(a, i, r, t, e, c, s, f) {
  const d = i.find((l) => l.id === a);
  if (!d)
    return e;
  s.push({
    ...d,
    x: c,
    y: e,
    width: d.type === "question" ? 120 : 160,
    height: 60
  });
  const g = d.type, n = d.height || 60;
  if (g !== "question") {
    const l = r.filter((m) => m.from === a);
    if (l.length > 0) {
      const m = l[0].to;
      return b(
        m,
        i,
        r,
        t,
        e + n + f.verticalSpacing,
        c,
        s,
        f
      );
    }
    return e;
  }
  const u = r.find(
    (l) => l.from === a && l.label === "Да"
  ), h = r.find(
    (l) => l.from === a && l.label === "Нет"
  );
  let o = e;
  if (u) {
    const l = f.mainAxisX + f.branchOffset, m = e + n;
    s.push({
      id: `${a}_yes_branch_return`,
      type: "action",
      text: "",
      x: f.mainAxisX,
      y: m + f.verticalSpacing * 2,
      width: 1,
      height: 1
    }), o = Math.max(
      o,
      $(
        u.to,
        i,
        r,
        t,
        m,
        l,
        f.mainAxisX,
        f,
        s
      )
    );
  }
  if (h) {
    const l = f.mainAxisX - f.branchOffset, m = e + n;
    s.push({
      id: `${a}_no_branch_return`,
      type: "action",
      text: "",
      x: f.mainAxisX,
      y: e + f.verticalSpacing * 2 + 50,
      width: 1,
      height: 1
    }), o = Math.max(
      o,
      $(
        h.to,
        i,
        r,
        t,
        m,
        l,
        f.mainAxisX,
        f,
        s
      )
    );
  }
  return o;
}
function $(a, i, r, t, e, c, s, f, d) {
  const g = i.find((h) => h.id === a);
  if (!g)
    return e;
  const n = g.height || 60;
  if (d.push({
    ...g,
    x: c,
    y: e,
    width: g.type === "question" ? 120 : 160,
    height: n
  }), g.type === "question")
    return b(
      a,
      i,
      r,
      t,
      e,
      c,
      d,
      f
    );
  const u = r.filter((h) => h.from === a);
  if (u.length > 0) {
    const h = u[0].to;
    return $(
      h,
      i,
      r,
      t,
      e + n + f.verticalSpacing,
      c,
      s,
      f,
      d
    );
  }
  return e + n;
}
const q = {
  id: "drakon",
  detector: (a) => /^\s*drakon\b/.test(a),
  loader: async () => ({
    parse: async (a) => {
      try {
        const i = await _.parse(a);
        if (!i.ok)
          throw new Error(i.error);
        return {
          type: "drakonDiagram",
          nodes: i.value.diagram.nodes,
          edges: i.value.diagram.edges
        };
      } catch (i) {
        throw i;
      }
    },
    renderer: {
      draw: async (a, i, r) => {
        const t = i.nodes || [], e = i.edges || [], c = C(t, e);
        if (!c.ok)
          return `<text x="50%" y="50%" text-anchor="middle" fill="red">Layout error: ${c.error}</text>`;
        const s = O(
          c.value.nodes,
          c.value.edges,
          { width: c.value.width, height: c.value.height }
        );
        return s.ok ? s.value.svgString : `<text x="50%" y="50%" text-anchor="middle" fill="red">SVG error: ${s.error}</text>`;
      }
    }
  })
};
X([q]);
export {
  q as default
};
