from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    """Create a Tasks by HTS icon with specified size"""
    # Create image with light gray background
    img = Image.new('RGB', (size, size), '#f0f2f5')
    draw = ImageDraw.Draw(img)
    
    # Calculate proportions
    t_width = int(size * 0.5)
    stroke_width = int(size * 0.12)
    
    # Halabja red color
    red_color = '#E63946'
    blue_color = '#2B4C7E'
    
    # Draw the "T" lettermark
    # Horizontal bar of T
    bar_y = int(size * 0.2)
    bar_height = stroke_width
    bar_x = int(size * 0.25)
    draw.rectangle([bar_x, bar_y, bar_x + t_width, bar_y + bar_height], fill=red_color)
    
    # Vertical stem of T
    stem_x = int(size * 0.5 - stroke_width / 2)
    stem_y = bar_y
    stem_height = int(size * 0.6)
    draw.rectangle([stem_x, stem_y, stem_x + stroke_width, stem_y + stem_height], fill=red_color)
    
    # Draw "by HTS" text
    font_size = int(size * 0.06)
    try:
        # Try to use a nice font if available
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        # Fall back to default font
        font = ImageFont.load_default()
    
    text = "by HTS"
    # Get text bounding box for centering
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_x = (size - text_width) // 2
    text_y = int(size * 0.85)
    
    draw.text((text_x, text_y), text, fill=blue_color, font=font)
    
    # Save the image
    img.save(output_path, 'PNG')
    print(f"Created {output_path}")

# Create both icon sizes
script_dir = os.path.dirname(os.path.abspath(__file__))
icons_dir = os.path.join(script_dir, 'icons')

# Ensure icons directory exists
os.makedirs(icons_dir, exist_ok=True)

# Generate icons
create_icon(512, os.path.join(icons_dir, 'icon-512x512.png'))
create_icon(192, os.path.join(icons_dir, 'icon-192x192.png'))

print("Icon generation complete!")
