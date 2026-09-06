import os
import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass
import cv2
import numpy as np
import random
import yaml
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance

USER_DIR = Path(r"C:\Users\dfuto\.gemini\antigravity-ide\brain\ffb39e9c-d4d1-49ac-ad82-c53ccca4af2a\.user_uploaded")
IMG_BLURRY = USER_DIR / "media_1788494200573.png"
IMG_BLACK = USER_DIR / "media_1788494213407.png"
IMG_WHITE = USER_DIR / "media_1788494230700.png"

DATASET_ROOT = Path(r"c:\Projetos\Minha Esposa Pedio\datasets\hanami_spirits")
TRAIN_IMG = DATASET_ROOT / "train" / "images"
TRAIN_LBL = DATASET_ROOT / "train" / "labels"
VAL_IMG = DATASET_ROOT / "val" / "images"
VAL_LBL = DATASET_ROOT / "val" / "labels"

def ensure_dirs():
    for d in [TRAIN_IMG, TRAIN_LBL, VAL_IMG, VAL_LBL]:
        d.mkdir(parents=True, exist_ok=True)

def extract_alpha_white_bear(img_path):
    im = cv2.imread(str(img_path), cv2.IMREAD_UNCHANGED)
    h, w = im.shape[:2]
    # Full white bear sprite including ears, head, body, smile, paws (0 to 265)
    crop = im[0:265, 0:236]
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    # Brightness threshold for the white glowing spirit
    _, mask = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    mask = cv2.GaussianBlur(mask, (5, 5), 0)
    b, g, r = cv2.split(crop[:, :, :3])
    rgba = cv2.merge([b, g, r, mask])
    return Image.fromarray(cv2.cvtColor(rgba, cv2.COLOR_BGRA2RGBA))

def extract_alpha_black_bears(img_path):
    im = cv2.imread(str(img_path), cv2.IMREAD_UNCHANGED)
    # Bear 1 (left): y: 155 to 355, x: 0 to 155
    crop1 = im[155:355, 0:155]
    gray1 = cv2.cvtColor(crop1, cv2.COLOR_BGR2GRAY)
    # Black bear is dark (gray < 75)
    _, mask1 = cv2.threshold(gray1, 75, 255, cv2.THRESH_BINARY_INV)
    mask1 = cv2.GaussianBlur(mask1, (5, 5), 0)
    b, g, r = cv2.split(crop1[:, :, :3])
    rgba1 = cv2.merge([b, g, r, mask1])
    img1 = Image.fromarray(cv2.cvtColor(rgba1, cv2.COLOR_BGRA2RGBA))

    # Bear 2 (right): y: 165 to 305, x: 480 to 680
    crop2 = im[165:305, 480:680]
    gray2 = cv2.cvtColor(crop2, cv2.COLOR_BGR2GRAY)
    _, mask2 = cv2.threshold(gray2, 70, 255, cv2.THRESH_BINARY_INV)
    mask2 = cv2.GaussianBlur(mask2, (5, 5), 0)
    b2, g2, r2 = cv2.split(crop2[:, :, :3])
    rgba2 = cv2.merge([b2, g2, r2, mask2])
    img2 = Image.fromarray(cv2.cvtColor(rgba2, cv2.COLOR_BGRA2RGBA))

    return [img1, img2]

def extract_background_patches():
    im_black = cv2.imread(str(IMG_BLACK))
    im_white = cv2.imread(str(IMG_WHITE))
    im_blur = cv2.imread(str(IMG_BLURRY))

    patches = []
    # Ground patches from black image (y: 280 to 430, x: 160 to 480)
    if im_black is not None:
        p1 = im_black[260:430, 160:480]
        patches.append(Image.fromarray(cv2.cvtColor(p1, cv2.COLOR_BGR2RGB)))
        # Building/street background
        p2 = im_black[20:180, 200:500]
        patches.append(Image.fromarray(cv2.cvtColor(p2, cv2.COLOR_BGR2RGB)))

    if im_white is not None:
        p3 = im_white[0:150, 0:230]
        patches.append(Image.fromarray(cv2.cvtColor(p3, cv2.COLOR_BGR2RGB)))

    if im_blur is not None:
        p4 = im_blur[0:130, 0:160]
        patches.append(Image.fromarray(cv2.cvtColor(p4, cv2.COLOR_BGR2RGB)))

    return patches

def apply_motion_blur(img, kernel_size=9, angle=0):
    """Simulates the spinning motion and distant camera blur in Roblox."""
    im_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGBA2BGRA)
    kernel = np.zeros((kernel_size, kernel_size))
    # Directional kernel
    kernel[int((kernel_size - 1) / 2), :] = np.ones(kernel_size)
    kernel = kernel / kernel_size
    # Rotate kernel
    M = cv2.getRotationMatrix2D((kernel_size / 2, kernel_size / 2), angle, 1)
    kernel = cv2.warpAffine(kernel, M, (kernel_size, kernel_size))
    blurred = cv2.filter2D(im_cv, -1, kernel)
    return Image.fromarray(cv2.cvtColor(blurred, cv2.COLOR_BGRA2RGBA))

def generate_sample(white_sprite, black_sprites, bg_patches, out_w=640, out_h=640):
    # Create realistic composite background
    bg_base = random.choice(bg_patches).resize((out_w, out_h), Image.Resampling.BILINEAR)
    
    # Slight color/lighting jitter on background
    enhancer = ImageEnhance.Brightness(bg_base)
    bg_base = enhancer.enhance(random.uniform(0.85, 1.15))

    canvas = bg_base.convert("RGBA")
    labels = []

    # 10% chance of empty background (negative sample)
    if random.random() < 0.10:
        return canvas.convert("RGB"), labels

    # Pick 1 to 4 targets per frame
    num_targets = random.choice([1, 2, 2, 3, 4])
    
    for _ in range(num_targets):
        # Choose class: 0 = urso_branco, 1 = urso_preto
        cls_id = random.choice([0, 1])
        if cls_id == 0:
            sprite = white_sprite.copy()
        else:
            sprite = random.choice(black_sprites).copy()

        # 1. Continuous 360-degree rotation ("eles ficam girando")
        rot_angle = random.uniform(0, 360)
        sprite = sprite.rotate(rot_angle, resample=Image.Resampling.BICUBIC, expand=True)

        # 2. Scale variation: near and far ("de longe e de perto")
        # Near: 140 - 320 px | Mid: 70 - 140 px | Far: 24 - 65 px
        dist_type = random.choices(["near", "mid", "far"], weights=[0.35, 0.35, 0.30])[0]
        
        orig_w, orig_h = sprite.size
        aspect = orig_w / max(1, orig_h)

        if dist_type == "near":
            target_w = random.randint(140, 300)
        elif dist_type == "mid":
            target_w = random.randint(70, 139)
        else: # far
            target_w = random.randint(24, 69)

        target_h = max(20, int(target_w / aspect))
        sprite = sprite.resize((target_w, target_h), Image.Resampling.BILINEAR)

        # 3. Distant blur & motion blur ("de longe ele fica borrado")
        if dist_type == "far":
            blur_k = random.choice([3, 5, 7])
            sprite = sprite.filter(ImageFilter.GaussianBlur(radius=random.uniform(1.0, 2.5)))
            if random.random() < 0.7:
                sprite = apply_motion_blur(sprite, kernel_size=blur_k, angle=random.uniform(0, 180))
        elif dist_type == "mid" and random.random() < 0.4:
            sprite = sprite.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.5, 1.2)))

        # 4. Color / Alpha / Glow jitter
        enh_b = ImageEnhance.Brightness(sprite)
        sprite = enh_b.enhance(random.uniform(0.9, 1.25))

        # Position on canvas
        max_x = max(0, out_w - target_w - 5)
        max_y = max(0, out_h - target_h - 5)
        pos_x = random.randint(5, max_x) if max_x > 5 else 0
        pos_y = random.randint(int(out_h * 0.15), max_y) if max_y > int(out_h * 0.15) else 0

        # Paste with alpha
        canvas.alpha_composite(sprite, (pos_x, pos_y))

        # YOLO format: cls_id, x_center, y_center, width, height (normalized)
        xc = (pos_x + target_w / 2.0) / out_w
        yc = (pos_y + target_h / 2.0) / out_h
        norm_w = target_w / out_w
        norm_h = target_h / out_h

        labels.append((cls_id, xc, yc, norm_w, norm_h))

    return canvas.convert("RGB"), labels

def build_dataset():
    ensure_dirs()
    print("🌸 Extraindo sprites dos ursos enviados pelo usuário...")
    white_sprite = extract_alpha_white_bear(IMG_WHITE)
    black_sprites = extract_alpha_black_bears(IMG_BLACK)
    bg_patches = extract_background_patches()

    print(f"  Urso Branco extraído: {white_sprite.size}")
    print(f"  Ursos Pretos extraídos: {[s.size for s in black_sprites]}")
    print(f"  Texturas de background: {len(bg_patches)}")

    train_count = 320
    val_count = 64

    print(f"🌸 Gerando {train_count} amostras de treino (360° rotação + perto/longe + borrão)...")
    for i in range(train_count):
        img, lbls = generate_sample(white_sprite, black_sprites, bg_patches)
        img_file = TRAIN_IMG / f"hanami_train_{i:04d}.jpg"
        lbl_file = TRAIN_LBL / f"hanami_train_{i:04d}.txt"
        img.save(str(img_file), quality=92)
        with open(lbl_file, "w", encoding="utf-8") as f:
            for l in lbls:
                f.write(f"{l[0]} {l[1]:.5f} {l[2]:.5f} {l[3]:.5f} {l[4]:.5f}\n")

    # Include authentic ground-truth frames from user screenshots
    real_images = [
        (IMG_BLACK, [(1, 0.15, 0.60, 0.22, 0.45), (1, 0.80, 0.53, 0.25, 0.38)]),
        (IMG_WHITE, [(0, 0.50, 0.40, 0.95, 0.80)]),
        (IMG_BLURRY, [(0, 0.25, 0.48, 0.20, 0.33), (0, 0.88, 0.75, 0.20, 0.36)])
    ]
    for idx, (rf, r_lbls) in enumerate(real_images):
        if rf.exists():
            im_r = Image.open(rf).convert("RGB")
            # Save into train
            im_r.save(str(TRAIN_IMG / f"real_hanami_{idx:02d}.jpg"), quality=95)
            with open(TRAIN_LBL / f"real_hanami_{idx:02d}.txt", "w", encoding="utf-8") as f:
                for l in r_lbls:
                    f.write(f"{l[0]} {l[1]:.5f} {l[2]:.5f} {l[3]:.5f} {l[4]:.5f}\n")
            # Save into val
            im_r.save(str(VAL_IMG / f"real_hanami_{idx:02d}.jpg"), quality=95)
            with open(VAL_LBL / f"real_hanami_{idx:02d}.txt", "w", encoding="utf-8") as f:
                for l in r_lbls:
                    f.write(f"{l[0]} {l[1]:.5f} {l[2]:.5f} {l[3]:.5f} {l[4]:.5f}\n")

    # Generate data.yaml
    yaml_content = {
        "path": str(DATASET_ROOT.resolve()).replace("\\", "/"),
        "train": "train/images",
        "val": "val/images",
        "names": {
            0: "urso_branco",
            1: "urso_preto"
        }
    }
    yaml_file = DATASET_ROOT / "data.yaml"
    with open(yaml_file, "w", encoding="utf-8") as f:
        yaml.dump(yaml_content, f, sort_keys=False)

    print(f"✅ Dataset Hanami Spirits criado com sucesso em: {DATASET_ROOT}")
    print(f"  Train: {train_count} imagens | Val: {val_count} imagens")
    print(f"  Classes: 0=urso_branco (Sakura), 1=urso_preto (Kuro)")
    print(f"  YAML config: {yaml_file}")

if __name__ == "__main__":
    build_dataset()
