from PIL import Image
import os
import glob

def compress_images(directory):
    print(f"Buscando imágenes en {directory}")
    
    # Comprimir WebP existentes
    webp_files = glob.glob(os.path.join(directory, "*.webp"))
    for file in webp_files:
        if "logo" in file.lower() or "contacts" in file.lower() or "profile" in file.lower():
            continue
            
        original_size = os.path.getsize(file) / (1024*1024)
        if original_size < 0.3: # saltar si es menor a 300kb
            continue
            
        try:
            img = Image.open(file)
            # Reducir dimensiones si es enorme
            max_width = 1920
            if img.width > max_width:
                ratio = max_width / img.width
                new_size = (max_width, int(img.height * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
            
            # Guardar con alta compresión
            img.save(file, "webp", quality=60, method=6)
            new_size_mb = os.path.getsize(file) / (1024*1024)
            print(f"Comprimido: {os.path.basename(file)} ({original_size:.2f} MB -> {new_size_mb:.2f} MB)")
        except Exception as e:
            print(f"Error con {file}: {e}")

if __name__ == '__main__':
    target_dir = r"c:\Users\User\.gemini\antigravity\scratch\dashboard-standalone\pagina_informativa-main\public\images"
    compress_images(target_dir)
    print("Compresión finalizada.")
