"""Remplace les icônes et l'écran de démarrage de Capacitor par ceux du Mémo SSIAP (à partir des images de la page)."""
import os
from PIL import Image, ImageDraw
RES = "android/app/src/main/res"
ROUGE = (179, 18, 31, 255)
icone = Image.open("icon-512.png").convert("RGBA")
masque = Image.open("maskable-512.png").convert("RGBA")
TAILLES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
for nom, px in TAILLES.items():
    d = f"{RES}/mipmap-{nom}"
    os.makedirs(d, exist_ok=True)
    carre = masque.resize((px, px), Image.LANCZOS)
    carre.save(f"{d}/ic_launcher.png")
    rond = Image.new("RGBA", (px * 4, px * 4), (0, 0, 0, 0))
    ImageDraw.Draw(rond).ellipse((0, 0, px * 4 - 1, px * 4 - 1), fill=255)
    m = rond.split()[3].resize((px, px), Image.LANCZOS)
    r = carre.copy(); r.putalpha(m); r.save(f"{d}/ic_launcher_round.png")
    fg = px * 108 // 48
    toile = Image.new("RGBA", (fg, fg), (0, 0, 0, 0))
    petit = icone.resize((fg * 62 // 100, fg * 62 // 100), Image.LANCZOS)
    toile.paste(petit, ((fg - petit.width) // 2, (fg - petit.height) // 2), petit)
    toile.save(f"{d}/ic_launcher_foreground.png")
for racine, _, fichiers in os.walk(RES):
    for f in fichiers:
        if f == "splash.png":
            p = os.path.join(racine, f)
            w, h = Image.open(p).size
            fond = Image.new("RGBA", (w, h), ROUGE)
            c = min(w, h) * 40 // 100
            logo = icone.resize((c, c), Image.LANCZOS)
            fond.paste(logo, ((w - c) // 2, (h - c) // 2), logo)
            fond.convert("RGB").save(p)
os.makedirs(f"{RES}/values", exist_ok=True)
open(f"{RES}/values/ic_launcher_background.xml", "w").write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#B3121F</color>\n</resources>\n')
print("icônes remplacées")
