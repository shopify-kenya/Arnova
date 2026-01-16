#!/usr/bin/env python3
"""Generate PWA icons and assets""
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("⚠️  PIL not installed. Skipping PWA asset generation.")
    exit(0)


def create_icon(size, output_path):
    """Create a simple icon with the letter A"""
    img = Image.new("RGB", (size, size), color="#8B7355")
    draw = ImageDraw.Draw(img)

    # Draw letter A
    font_size = int(size * 0.6)
    try:
        font = ImageFont.truetype(
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size
        )
    except OSError:
        font = ImageFont.load_default()

    text = "A"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    x = (size - text_width) // 2
    y = (size - text_height) // 2

    draw.text((x, y), text, fill="white", font=font)

    img.save(output_path, "PNG")
    print(f"✅ Created {output_path}")


def main():
    """Generate all PWA assets"""
    public_dir = Path(__file__).parent / "public"
    public_dir.mkdir(exist_ok=True)

    # Icon sizes for PWA
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]

    for size in sizes:
        icon_path = public_dir / f"icon-{size}x{size}.png"
        if not icon_path.exists():
            create_icon(size, icon_path)

    # Create favicon
    favicon_path = public_dir / "favicon.ico"
    if not favicon_path.exists():
        img = Image.new("RGB", (32, 32), color="#8B7355")
        draw = ImageDraw.Draw(img)
        draw.text((8, 4), "A", fill="white")
        img.save(favicon_path, "ICO")
        print(f"✅ Created {favicon_path}")

    print("🎉 PWA assets generated successfully!")


if __name__ == "__main__":
    main()
