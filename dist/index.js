class D extends Error {
  constructor(c) {
    super(c), this.name = "I18nError", Object.setPrototypeOf(this, new.target.prototype);
  }
}
function M(i) {
  if (i == null)
    throw new TypeError("options is required");
  if (typeof i != "object" || Array.isArray(i))
    throw new TypeError("options must be an object");
  if (!("defaultLocale" in i))
    throw new TypeError("defaultLocale is required");
  if (typeof i.defaultLocale != "string")
    throw new TypeError("defaultLocale must be a string");
  if (i.defaultLocale.trim() === "")
    throw new TypeError("defaultLocale cannot be empty");
  if (i.translations !== void 0 && (typeof i.translations != "object" || Array.isArray(i.translations)))
    throw new TypeError("translations must be an object");
  if (i.loadPath !== void 0 && typeof i.loadPath != "function")
    throw new TypeError("loadPath must be a function");
  const c = /* @__PURE__ */ new Map();
  let f = i.defaultLocale;
  const p = i.fallbackLocale, g = i.loadPath, E = /* @__PURE__ */ new Set(), h = /* @__PURE__ */ new Set();
  let j = "key";
  const b = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Set();
  if (i.translations)
    for (const [e, n] of Object.entries(i.translations))
      c.set(e, w(n));
  function w(e) {
    const n = /* @__PURE__ */ Object.create(null), t = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
    for (const o of Object.keys(e))
      if (!t.has(o) && Object.prototype.hasOwnProperty.call(e, o)) {
        const r = e[o];
        if (r === void 0) continue;
        r && typeof r == "object" && !Array.isArray(r) ? n[o] = w(r) : n[o] = r;
      }
    return n;
  }
  function O(e, n) {
    const t = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
    for (const r of Object.keys(e))
      if (!o.has(r) && Object.prototype.hasOwnProperty.call(e, r)) {
        const a = e[r];
        a !== void 0 && (t[r] = a);
      }
    for (const r of Object.keys(n))
      if (!o.has(r) && Object.prototype.hasOwnProperty.call(n, r)) {
        const a = n[r];
        if (a === void 0) continue;
        if (a && typeof a == "object" && !Array.isArray(a) && !T(a)) {
          const s = t[r];
          s && typeof s == "object" && !Array.isArray(s) ? t[r] = O(s, a) : t[r] = w(a);
        } else
          t[r] = a;
      }
    return t;
  }
  function T(e) {
    if (typeof e != "object") return !1;
    const n = Object.keys(e), t = ["zero", "one", "two", "few", "many", "other"];
    return n.length > 0 && n.every((o) => t.includes(o));
  }
  function v(e, n) {
    const t = c.get(e);
    if (!t) return null;
    const o = n.split(".");
    let r = t;
    for (const a of o)
      if (r && typeof r == "object" && !Array.isArray(r)) {
        if (T(r))
          return null;
        const s = r;
        if (Object.prototype.hasOwnProperty.call(s, a)) {
          const l = s[a];
          if (l === void 0) return null;
          r = l;
        } else
          return null;
      } else
        return null;
    return typeof r == "string" ? r : null;
  }
  function k(e, n) {
    if (!n) return e;
    let t = e;
    for (const [o, r] of Object.entries(n)) {
      const a = new RegExp(`\\{\\{\\s*${o}\\s*\\}\\}`, "g");
      let s = "";
      r == null ? s = "" : s = String(r), t = t.replace(a, s);
    }
    return t;
  }
  function I(e, n) {
    if (n === 0) return "zero";
    const t = Math.abs(n);
    return new Intl.PluralRules(e).select(t);
  }
  function A(e, n, t) {
    const o = c.get(e);
    if (!o) return null;
    const r = n.split(".");
    let a = o;
    for (const s of r)
      if (a && typeof a == "object" && !Array.isArray(a)) {
        const l = a;
        if (Object.prototype.hasOwnProperty.call(l, s)) {
          const u = l[s];
          if (u === void 0) return null;
          a = u;
        } else
          return null;
      } else
        return null;
    if (T(a) && typeof t.count == "number") {
      const s = a, l = t.count, u = I(e, l);
      if (u === "zero" && s.zero !== void 0)
        return s.zero;
      if (Object.prototype.hasOwnProperty.call(s, u) && s[u] !== void 0) {
        const d = s[u];
        if (d !== void 0)
          return d;
      }
      return s.other;
    }
    return null;
  }
  function _(e, n) {
    if (typeof e != "string")
      throw new TypeError("key must be a string");
    if (n !== void 0 && (typeof n != "object" || Array.isArray(n)))
      throw new TypeError("params must be an object");
    const t = e.trim();
    if (t === "") return "";
    const o = n && "count" in n && typeof n.count == "number";
    let r = null;
    o && (r = A(f, t, n)), r ?? (r = v(f, t));
    const a = r !== null;
    if (r === null && p && (o && (r = A(p, t, n)), r ?? (r = v(p, t))), r === null)
      switch (h.forEach((s) => {
        try {
          s(t, f);
        } catch (l) {
          console.error("Missing callback error:", l);
        }
      }), j) {
        case "empty":
          return "";
        case "throw":
          throw new D(`Missing translation: ${t}`);
        case "key":
        default:
          return t;
      }
    return !a && p && h.forEach((s) => {
      try {
        s(t, f);
      } catch (l) {
        console.error("Missing callback error:", l);
      }
    }), k(r, n);
  }
  function L(e) {
    const n = ((t, o) => {
      const r = e ? `${e}.${t}` : t;
      return _(r, o);
    });
    return n.namespace = (t) => {
      if (t != null && typeof t != "string")
        throw new TypeError("prefix must be a string");
      const o = t ?? "", r = e ? o ? `${e}.${o}` : e : o;
      return L(r || void 0);
    }, n;
  }
  const P = L(), y = {
    t: P,
    getLocale() {
      return f;
    },
    setLocale(e) {
      if (typeof e != "string")
        throw new TypeError("locale must be a string");
      if (e.trim() === "")
        throw new TypeError("locale cannot be empty");
      if (e === f)
        return y;
      const n = c.size > 0;
      if (!c.has(e) && n && !p)
        throw new Error(`No translations available for locale '${e}'`);
      const t = f;
      return f = e, E.forEach((o) => {
        try {
          o(e, t);
        } catch (r) {
          console.error("Change callback error:", r);
        }
      }), y;
    },
    async setLocaleAsync(e) {
      return !m.has(e) && g && await y.loadLocale(e), y.setLocale(e);
    },
    getAvailableLocales() {
      return Array.from(c.keys());
    },
    addTranslations(e, n) {
      if (typeof e != "string")
        throw new TypeError("locale must be a string");
      if (e.trim() === "")
        throw new TypeError("locale cannot be empty");
      if (typeof n != "object" || Array.isArray(n))
        throw new TypeError("translations must be an object");
      const t = c.get(e);
      return t ? c.set(e, O(t, n)) : (c.set(e, w(n)), m.add(e)), y;
    },
    hasKey(e, n) {
      if (typeof e != "string")
        throw new TypeError("key must be a string");
      if (n !== void 0 && typeof n != "string")
        throw new TypeError("locale must be a string");
      const t = n ?? f;
      if (v(t, e) !== null) return !0;
      const r = c.get(t);
      if (!r) return !1;
      const a = e.split(".");
      let s = r;
      for (const l of a)
        if (s && typeof s == "object" && !Array.isArray(s)) {
          const u = s;
          if (Object.prototype.hasOwnProperty.call(u, l)) {
            const d = u[l];
            if (d === void 0) return !1;
            s = d;
          } else
            return !1;
        } else
          return !1;
      return !0;
    },
    getTranslations(e) {
      const n = e ?? f, t = c.get(n);
      return t ? w(t) : {};
    },
    loadLocale(e, n) {
      if (!g)
        throw new Error("loadPath not configured");
      const t = (n == null ? void 0 : n.forceReload) ?? !1;
      if (!t && b.has(e)) {
        const r = b.get(e);
        if (r)
          return r;
      }
      if (!t && m.has(e))
        return Promise.resolve();
      const o = (async () => {
        try {
          const r = await g(e);
          if (typeof r != "object" || Array.isArray(r))
            throw new TypeError("loadPath must return an object");
          y.addTranslations(e, r), m.add(e);
        } finally {
          b.delete(e);
        }
      })();
      return b.set(e, o), o;
    },
    isLocaleLoaded(e) {
      return c.has(e);
    },
    onChange(e) {
      if (typeof e != "function")
        throw new TypeError("callback must be a function");
      return E.add(e), () => {
        E.delete(e);
      };
    },
    onMissing(e) {
      if (typeof e != "function")
        throw new TypeError("callback must be a function");
      return h.add(e), () => {
        h.delete(e);
      };
    },
    setMissingBehavior(e) {
      if (!["key", "empty", "throw"].includes(e))
        throw new TypeError("behavior must be one of: key, empty, throw");
      return j = e, y;
    },
    namespace(e) {
      return P.namespace(e);
    },
    formatNumber(e, n) {
      if (typeof e != "number")
        throw new TypeError("value must be a number");
      return new Intl.NumberFormat(f, n).format(e);
    },
    formatDate(e, n) {
      let t;
      if (e instanceof Date)
        t = e;
      else if (typeof e == "number")
        t = new Date(e);
      else if (typeof e == "string")
        t = new Date(e);
      else
        throw new TypeError("value must be a valid date");
      if (isNaN(t.getTime()))
        throw new TypeError("value must be a valid date");
      return new Intl.DateTimeFormat(f, n).format(t);
    },
    formatRelativeTime(e, n) {
      if (typeof e != "number")
        throw new TypeError("value must be a number");
      return new Intl.RelativeTimeFormat(f).format(e, n);
    }
  };
  return y;
}
export {
  D as I18nError,
  M as createI18n
};
