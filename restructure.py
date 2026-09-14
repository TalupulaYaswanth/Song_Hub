import os
import shutil

base_dir = r"c:\Users\V\OneDrive\ドキュメント\Rockstar Games\Red Dead Redemption 2\SongToTextApp"
templates_dir = os.path.join(base_dir, "templates")
static_dir = os.path.join(base_dir, "static")

os.makedirs(templates_dir, exist_ok=True)
os.makedirs(static_dir, exist_ok=True)

moves = [
    ("index.html", os.path.join(templates_dir, "index.html")),
    ("owner/index.html", os.path.join(templates_dir, "owner.html")),
    ("style.css", os.path.join(static_dir, "style.css")),
    ("script.js", os.path.join(static_dir, "script.js")),
    ("owner/owner.js", os.path.join(static_dir, "owner.js")),
    ("owner/style.css", os.path.join(static_dir, "owner.css")),
    ("assets", os.path.join(static_dir, "assets"))
]

for src, dst in moves:
    src_path = os.path.join(base_dir, src)
    if os.path.exists(src_path):
        shutil.move(src_path, dst)
        print(f"Moved {src} to {dst}")
    else:
        print(f"File {src} not found, skipped.")

# Try to remove empty owner dir
try:
    os.rmdir(os.path.join(base_dir, "owner"))
except:
    pass

print("Restructuring complete.")
