import os
from PIL import Image, ImageDraw

def create_icon(size, path):
    img = Image.new('RGB', (size, size), color='#10b981')
    draw = ImageDraw.Draw(img)
    # Draw a white circle in the center
    margin = size * 0.2
    draw.ellipse((margin, margin, size - margin, size - margin), fill='white')
    # Save the image
    img.save(path)

icons_dir = 'public/icons'
os.makedirs(icons_dir, exist_ok=True)
create_icon(192, f'{icons_dir}/icon-192.png')
create_icon(512, f'{icons_dir}/icon-512.png')
print("Icons generated successfully!")
