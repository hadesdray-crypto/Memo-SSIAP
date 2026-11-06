// Prépare la version d'essai : chiffre index.html et fabrique des codes d'essai (24 h).
// Usage : node essai/preparer.mjs <nombre de codes> <jours pour activer le code> [heures d'essai]
// Les codes sont affichés une seule fois à l'écran ; seuls leurs « cadenas » (codes.json) sont gardés.
import { readFileSync, writeFileSync } from "node:fs";
import { webcrypto as c } from "node:crypto";
const N = Math.min(32, Number(process.argv[2] || 10)), JOURS = Number(process.argv[3] || 14), HEURES = Number(process.argv[4] || 24);
const ALPHA = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const alea = (n) => Array.from(c.getRandomValues(new Uint8Array(n)), (x) => ALPHA[x % 32]).join("");
const b64 = (u) => Buffer.from(u).toString("base64");
let html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
// 1. L'essai ne doit jamais proposer ni télécharger la vraie application.
const a = "async function majVerifier(manuel) {";
if (!html.includes(a)) throw new Error("majVerifier introuvable");
html = html.replace(a, a + " return;");
html = html.replace(/const API_REL = "[^"]*";/, 'const API_REL = "about:blank";').replace(/const LIEN_APK = [^;]*;/, 'const LIEN_APK = "about:blank";');
if (!html.includes('const API_REL = "about:blank"')) throw new Error("API_REL non neutralisé");
// 2. Chiffrement du contenu avec une clé unique.
const K = c.getRandomValues(new Uint8Array(32)), iv = c.getRandomValues(new Uint8Array(12));
const kc = await c.subtle.importKey("raw", K, "AES-GCM", false, ["encrypt"]);
const ct = new Uint8Array(await c.subtle.encrypt({ name: "AES-GCM", iv }, kc, new TextEncoder().encode(html)));
const out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12);
writeFileSync(new URL("./contenu.enc", import.meta.url), out);
// 3. Un cadenas par code : seule la personne qui a le code peut récupérer la clé.
const avant = Date.now() + JOURS * 86400000, cadenas = [], codes = [], ids = new Set();
for (let i = 0; i < N; i++) {
  let id; do { id = alea(1); } while (ids.has(id)); ids.add(id);
  const secret = alea(8), salt = c.getRandomValues(new Uint8Array(16)), iv2 = c.getRandomValues(new Uint8Array(12));
  const base = await c.subtle.importKey("raw", new TextEncoder().encode(secret), "PBKDF2", false, ["deriveKey"]);
  const wk = await c.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const data = new TextEncoder().encode(JSON.stringify({ k: b64(K), h: HEURES, avant, id }));
  const w = new Uint8Array(await c.subtle.encrypt({ name: "AES-GCM", iv: iv2 }, wk, data));
  cadenas.push({ id, s: b64(salt), i: b64(iv2), w: b64(w) });
  const t = id + secret; codes.push(t.match(/.{3}/g).join("-"));
}
writeFileSync(new URL("./codes.json", import.meta.url), JSON.stringify(cadenas));
console.log("Valables pour activation jusqu'au " + new Date(avant).toISOString() + ", essai de " + HEURES + " h après activation.\n" + codes.join("\n"));
