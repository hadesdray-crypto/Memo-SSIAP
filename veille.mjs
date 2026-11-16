// Robot de veille réglementaire du Mémo SSIAP (lancé par GitHub Actions chaque lundi, ou à la main).
// Il relit les pages officielles citées par l'appli, repère celles qui ont changé et publie veille.json.
// Il ne modifie JAMAIS le contenu de l'appli : il prévient, une personne vérifie et corrige.
// Gemini (facultatif, clé GEMINI_API_KEY dans les secrets du dépôt) résume les changements
// et cherche les textes officiels récemment publiés. Aucune dépendance : Node.js 18 ou plus.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const KEY = (process.env.GEMINI_API_KEY || "").trim();
const BASE = process.env.GEMINI_BASE || "https://generativelanguage.googleapis.com/v1beta";
const DIR = process.env.VEILLE_DIR || ".";
const NOW = process.env.VEILLE_NOW ? new Date(process.env.VEILLE_NOW) : new Date();
const TODAY = NOW.toISOString().slice(0, 10);
const UA = "Mozilla/5.0 (compatible; MemoSSIAP-veille/1.0; verification hebdomadaire)";
const OFFICIELS = ["legifrance.gouv.fr", "journal-officiel.gouv.fr", "interieur.gouv.fr", "ecologie.gouv.fr", "travail-emploi.gouv.fr", "cnaps.interieur.gouv.fr", "service-public.gouv.fr", "service-public.fr", "afnor.org", "boutique.afnor.org", "norminfo.afnor.org", "cnpp.com", "inrs.fr", "gouv.fr"];

const read = (f, d) => { try { return JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")); } catch (e) { return d; } };
const write = (f, o) => fs.writeFileSync(path.join(DIR, f), JSON.stringify(o, null, 1) + "\n");
const sha = (x, n = 64) => crypto.createHash("sha256").update(x).digest("hex").slice(0, n);
const short = (s) => crypto.createHash("sha1").update(s.toLowerCase()).digest("hex").slice(0, 12);
const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const log = (...a) => console.log(...a);

const sources = read("veille-sources.json", []).filter((s) => s && /^https?:\/\//.test(s.u || ""));
const etat = read("veille-etat.json", null) || { v: 1, pages: {}, echecs: {}, vus: [] };
etat.pages = etat.pages || {}; etat.echecs = etat.echecs || {}; etat.vus = etat.vus || [];
const avant = read("veille.json", null) || { alertes: [], recherche: [] };
const premiere = !Object.keys(etat.pages).length;
const erreurs = [];

/* ---------- Lecture d'une page ---------- */
async function lire(url) {
  try {
    const r = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(30000), headers: { "user-agent": UA, "accept-language": "fr-FR,fr;q=0.9", accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.5" } });
    const type = r.headers.get("content-type") || "";
    const buf = Buffer.from(await r.arrayBuffer());
    return { ok: r.ok, status: r.status, type, buf };
  } catch (e) {
    return { ok: false, status: 0, err: e && e.name === "TimeoutError" ? "délai dépassé" : "connexion impossible" };
  }
}
const ENT = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", eacute: "é", egrave: "è", ecirc: "ê", euml: "ë", agrave: "à", acirc: "â", ccedil: "ç", ocirc: "ô", ouml: "ö", ucirc: "û", ugrave: "ù", uuml: "ü", icirc: "î", iuml: "ï", laquo: "«", raquo: "»", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", hellip: "…", ndash: "–", mdash: "—", deg: "°", sup2: "²", sup3: "³", oelig: "œ", Eacute: "É", Egrave: "È", Agrave: "À", Ccedil: "Ç" };
function decode(buf, type) {
  const head = buf.subarray(0, 4096).toString("latin1");
  const cs = (/charset=["']?([\w-]+)/i.exec(type) || /<meta[^>]+charset=["']?([\w-]+)/i.exec(head) || [])[1] || "utf-8";
  try { return new TextDecoder(cs.toLowerCase()).decode(buf); } catch (e) { return buf.toString("utf8"); }
}
/* Texte utile d'une page : paragraphes d'au moins 30 caractères, sans menus ni dates de mise à jour */
function lignes(html) {
  const s = html.replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|template|iframe|header|footer|nav|form|button|select)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(?:br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/td|\/th|\/section|\/article|\/dd|\/dt|\/blockquote|\/table|\/ul|\/ol)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x?[0-9a-f]+|[a-z0-9]+);/gi, (m, e) => {
      if (e[0] !== "#") return ENT[e] ?? ENT[e.toLowerCase()] ?? m;
      try { return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)); } catch (er) { return " "; }
    });
  const out = [], seen = new Set();
  for (const l0 of s.split("\n")) {
    const l = l0.replace(/\s+/g, " ").trim();
    if (l.length < 30) continue;
    if (/cookie|javascript|newsletter|abonnez|se connecter|connexion|partager|imprimer|mis à jour le|mise à jour le|dernière mise à jour|modifié le|publié le|consulté le|version en vigueur au|tous droits réservés|haut de page/i.test(l)) continue;
    const k = short(l);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(l);
  }
  return out;
}

/* ---------- Gemini (facultatif) ---------- */
let modele = null;
async function choisirModele() {
  if (modele) return modele;
  if (etat.modele && etat.modeleLe && days(etat.modeleLe, TODAY) < 14) return (modele = etat.modele);
  const r = await fetch(`${BASE}/models?pageSize=200`, { headers: { "x-goog-api-key": KEY }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`liste des modèles : erreur ${r.status}`);
  const j = await r.json();
  const bad = /(image|tts|audio|live|embed|vision|learnlm|gemma|aqa|robotics|computer|native|nano|veo|imagen|-exp|experimental)/;
  const ver = (n) => { const m = /gemini-(\d+(?:\.\d+)?)/.exec(n); return m ? parseFloat(m[1]) : 0; };
  const score = (n) => (!/^gemini/.test(n) || bad.test(n) ? -1 : ver(n) * 10 + (/flash/.test(n) ? 100 : 0) - (/lite/.test(n) ? 30 : 0) - (/pro/.test(n) ? 15 : 0) - (/preview/.test(n) ? 12 : 0));
  const noms = (j.models || []).filter((m) => (m.supportedGenerationMethods || []).includes("generateContent")).map((m) => String(m.name).replace(/^models\//, ""));
  const best = noms.map((n) => [n, score(n)]).filter((x) => x[1] >= 0).sort((a, b) => b[1] - a[1])[0];
  if (!best) throw new Error("aucun modèle Gemini utilisable");
  etat.modele = modele = best[0];
  etat.modeleLe = TODAY;
  return modele;
}
function json(text) {
  let s = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const a = s.search(/[[{]/), b = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  try { return JSON.parse(s); } catch (e) { return JSON.parse(s.replace(/,\s*([}\]])/g, "$1")); }
}
async function gemini(prompt, recherche = false) {
  const m = await choisirModele();
  const body = { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, ...(recherche ? {} : { responseMimeType: "application/json" }) }, ...(recherche ? { tools: [{ google_search: {} }] } : {}) };
  for (let essai = 0; essai < 3; essai++) {
    const r = await fetch(`${BASE}/models/${encodeURIComponent(m)}:generateContent`, { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": KEY }, body: JSON.stringify(body), signal: AbortSignal.timeout(120000) });
    if (r.status >= 500 && essai < 2) { await new Promise((ok) => setTimeout(ok, 3000 * (essai + 1))); continue; }
    if (!r.ok) throw new Error(`Gemini : erreur ${r.status}`);
    const j = await r.json();
    const parts = (j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts) || [];
    return json(parts.filter((p) => !p.thought && typeof p.text === "string").map((p) => p.text).join(""));
  }
  throw new Error("Gemini indisponible");
}

/* ---------- Pages officielles ---------- */
const changements = [], injoignables = [];
let lues = 0;
for (const src of sources) {
  const res = await lire(src.u);
  if (!res.ok) {
    etat.echecs[src.k] = (etat.echecs[src.k] || 0) + 1;
    if (etat.echecs[src.k] >= 2) injoignables.push({ t: src.t, o: src.o, u: src.u, code: res.status ? `erreur ${res.status}` : res.err });
    log(`  ✗ ${src.t} : ${res.status || res.err}`);
    continue;
  }
  etat.echecs[src.k] = 0;
  lues++;
  const pdf = /pdf/i.test(res.type) || /\.pdf($|\?)/i.test(src.u);
  const txt = pdf ? null : lignes(decode(res.buf, res.type));
  const paras = txt ? txt.map(short) : null;
  const h = pdf ? sha(res.buf) : sha(paras.join(","));
  const old = etat.pages[src.k];
  etat.pages[src.k] = { h, p: paras ? paras.slice(0, 5000) : null, chg: old && old.h !== h ? TODAY : old ? old.chg || null : null };
  if (!old || old.h === h) continue;
  if (pdf) { changements.push({ src, pdf: true, ajout: [], suppr: 0 }); continue; }
  const os = new Set(old.p || []), ns = new Set(paras);
  const ajout = txt.filter((l) => !os.has(short(l)));
  const suppr = (old.p || []).filter((x) => !ns.has(x)).length;
  if (ajout.length || suppr) changements.push({ src, pdf: false, ajout, suppr });
}
log(`Sources relues : ${lues} / ${sources.length}${premiere ? " (première lecture : état de référence enregistré)" : ""}`);

/* ---------- Alertes ---------- */
const nouvelles = [];
for (const c of changements) {
  const a = { id: sha(c.src.k + TODAY, 10), date: TODAY, type: c.pdf ? "pdf" : "page", t: c.src.t, o: c.src.o, u: c.src.u, fiches: (c.src.fiches || []).slice(0, 12), portee: "incertain",
    resume: c.pdf ? "Le document officiel a été remplacé par une nouvelle version. À vérifier." : `La page a changé depuis la dernière vérification (${c.ajout.length} passage${c.ajout.length > 1 ? "s" : ""} nouveau${c.ajout.length > 1 ? "x" : ""} ou modifié${c.ajout.length > 1 ? "s" : ""}, ${c.suppr} supprimé${c.suppr > 1 ? "s" : ""}). À vérifier.` };
  if (KEY && !c.pdf) {
    try {
      const extraits = c.ajout.join("\n").slice(0, 6000);
      const j = await gemini(`Tu fais la veille réglementaire du Mémo SSIAP, une appli pour les agents de sécurité incendie (SSIAP 1, 2, 3) et les agents de sécurité privée en France.
La page officielle suivante, citée par l'appli, a changé depuis la dernière vérification.
Source : ${c.src.t} (${c.src.o}) – ${c.src.u}
Fiches de l'appli qui s'appuient sur cette source : ${(c.src.fiches || []).join(" ; ") || "aucune précisée"}
Passages nouveaux ou modifiés :
"""
${extraits || "(aucun passage ajouté)"}
"""
Nombre de passages supprimés : ${c.suppr}
Réponds uniquement en JSON : {"portee":"regles|forme|incertain","resume":"deux phrases simples en français","fiches":["titres exacts des fiches concernées, pris dans la liste"]}
- "regles" : une règle, un chiffre, une obligation, une procédure ou une date d'application a changé.
- "forme" : seulement la présentation, la navigation, des actualités sans rapport avec les règles, ou une correction de forme.
- "incertain" : impossible de savoir avec ces passages.
N'invente rien : appuie-toi seulement sur les passages fournis.`);
      if (j && ["regles", "forme", "incertain"].includes(j.portee)) a.portee = j.portee;
      if (j && typeof j.resume === "string" && j.resume.trim()) a.resume = j.resume.trim().slice(0, 600);
      if (j && Array.isArray(j.fiches)) { const ok = j.fiches.filter((f) => (c.src.fiches || []).includes(f)); if (ok.length) a.fiches = ok.slice(0, 12); }
      a.ia = true;
    } catch (e) { erreurs.push(`Résumé de « ${c.src.t} » : ${e.message}`); }
  }
  if (a.portee === "forme") { log(`  ~ ${c.src.t} : changement de forme, pas d'alerte`); continue; }
  nouvelles.push(a);
  log(`  ! ${c.src.t} : ${a.portee}`);
}

/* ---------- Textes récemment publiés (recherche Google par Gemini) ---------- */
const trouves = [];
if (KEY) {
  const depuis = avant.maj ? String(avant.maj).slice(0, 10) : new Date(NOW - 7 * 864e5).toISOString().slice(0, 10);
  try {
    const j = await gemini(`Cherche sur le web les textes officiels français publiés ou modifiés depuis le ${depuis} (inclus) qui concernent :
la sécurité incendie dans les établissements recevant du public (ERP) et les immeubles de grande hauteur (IGH) ; les agents des services de sécurité incendie (SSIAP, arrêté du 2 mai 2005) ; le règlement de sécurité contre l'incendie ; les agents de sécurité privée (Code de la sécurité intérieure, livre VI, CNAPS, carte professionnelle) ; les normes des extincteurs, des systèmes de sécurité incendie et de l'éclairage de sécurité.
Ne retiens que des sources officielles (legifrance.gouv.fr, journal officiel, interieur.gouv.fr, ecologie.gouv.fr, travail-emploi.gouv.fr, cnaps.interieur.gouv.fr, afnor.org) et seulement des textes réellement publiés ou modifiés depuis cette date.
Réponds uniquement en JSON : {"textes":[{"titre":"…","date":"AAAA-MM-JJ","url":"https://…","resume":"une phrase simple"}]}
Si rien de nouveau, réponds {"textes":[]}. N'invente rien.`, true);
    const list = (j && Array.isArray(j.textes) ? j.textes : []).slice(0, 10);
    for (const x of list) {
      let u;
      try { u = new URL(String(x.url || "")); } catch (e) { continue; }
      const host = u.hostname.replace(/^www\./, "");
      if (u.protocol !== "https:" || !OFFICIELS.some((d) => host === d || host.endsWith("." + d))) continue;
      const d = String(x.date || "").slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || days(depuis, d) < -3 || days(d, TODAY) < 0) continue;
      if (etat.vus.includes(u.href) || !String(x.titre || "").trim()) continue;
      etat.vus.push(u.href);
      trouves.push({ id: sha(u.href, 10), date: d, titre: String(x.titre).trim().slice(0, 200), u: u.href, resume: String(x.resume || "").trim().slice(0, 400) });
    }
    etat.vus = etat.vus.slice(-400);
    log(`Recherche de nouveaux textes depuis le ${depuis} : ${trouves.length} trouvé(s)`);
  } catch (e) { erreurs.push(`Recherche des nouveaux textes : ${e.message}`); }
} else log("Pas de clé Gemini : détection des changements seulement (sans résumé ni recherche).");

/* ---------- Publication ---------- */
const recent = (a) => days(a.date, TODAY) <= 180;
const out = {
  v: 1,
  maj: NOW.toISOString(),
  sources: sources.length,
  lues,
  premiere,
  gemini: !!KEY,
  injoignables,
  alertes: [...nouvelles, ...(avant.alertes || []).filter((a) => !nouvelles.some((n) => n.id === a.id))].filter(recent).slice(0, 60),
  recherche: [...trouves, ...(avant.recherche || [])].filter(recent).slice(0, 40),
  erreurs: erreurs.slice(0, 10),
};
write("veille.json", out);
write("veille-etat.json", etat);
log(`Alertes nouvelles : ${nouvelles.length} · textes signalés : ${trouves.length} · sources injoignables : ${injoignables.length}${erreurs.length ? ` · erreurs : ${erreurs.join(" | ")}` : ""}`);
