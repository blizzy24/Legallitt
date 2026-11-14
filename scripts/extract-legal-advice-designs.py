from pathlib import Path
import zipfile

root = Path('design/figma-2026-11-12').resolve()
archive = root / 'legal-advice-profile-designs.zip'
with zipfile.ZipFile(archive) as bundle:
    files = [item for item in bundle.infolist() if not item.is_dir()]
    for item in files:
        target = (root / item.filename).resolve()
        if not target.is_relative_to(root):
            raise RuntimeError('Archive path escapes design directory')
    images = [item for item in files if item.filename.lower().endswith('.png')]
    if len(images) != 89:
        print(f'COUNT DISCREPANCY: request says 89 PNGs; supplied archive contains {len(images)} PNGs')
    bundle.extractall(root)
    for item in images:
        if (root / item.filename).stat().st_size != item.file_size:
            raise RuntimeError('Extracted image size mismatch')
    print(f'Extracted and verified {len(images)} PNGs')
    for folder in sorted({Path(item.filename).parts[0] for item in images}):
        print(folder, sum(Path(item.filename).parts[0] == folder for item in images))
archive.unlink()
print('Removed verified source ZIP as requested')
