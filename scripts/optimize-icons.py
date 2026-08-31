from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / "assets" / "images"
for name in ("icon.png", "splash-icon.png", "favicon.png", "android-icon-foreground.png"):
    path = root / name
    image = Image.open(path).convert("RGB")
    image.thumbnail((768, 768), Image.Resampling.LANCZOS)
    image.save(path, format="PNG", optimize=True, compress_level=9)
