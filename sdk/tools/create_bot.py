import os
import sys
import json
import shutil
import argparse
from pathlib import Path

def create_bot(name: str, game: str, bot_id: str, bot_type: str = "vision", model: str = "", target_class: str = "target"):
    base_dir = Path(__file__).resolve().parent.parent.parent
    clean_game = game.lower().replace(" ", "_")
    clean_name = name.lower().replace(" ", "_").replace("-", "_")

    target_dir = base_dir / "bots" / clean_game / clean_name
    if target_dir.exists():
        print(f"Erro: O diretório do bot já existe: {target_dir}")
        return False

    template_dir = base_dir / "bot-templates" / "vision-bot"
    if not template_dir.exists():
        print(f"Erro: Template não encontrado em: {template_dir}")
        return False

    shutil.copytree(template_dir, target_dir)

    # Update bot.json
    manifest_path = target_dir / "bot.json"
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    manifest["id"] = bot_id or f"{clean_game}.{clean_name}"
    manifest["name"] = name
    manifest["game"] = game
    manifest["experience"] = name
    if model:
        manifest["vision"]["models"] = [model]

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    # Update config.py
    config_path = target_dir / "config.py"
    with open(config_path, "w", encoding="utf-8") as f:
        f.write(f'''# Configurações geradas automaticamente para {name}
CONFIG = {{
    "model_path": "{model}",
    "device": "auto",
    "conf_thres": 0.25,
    "iou_thres": 0.45,
    "simulation_mode": True,
    "window_title": "{game}",
    "target_class": "{target_class}",
}}
''')

    # Update README.md
    readme_path = target_dir / "README.md"
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(f'''# {name}

Bot automatizado para **{game}** construído com o Bot SDK.

## Informações:
- **ID:** `{manifest["id"]}`
- **Classe Alvo:** `{target_class}`
- **Modelo:** `{model or "Pendente"}`

## Execução:
```bash
python main.py
```
''')

    print(f"Bot criado com sucesso em: {target_dir}")
    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Bot Scaffold Generator para Bot SDK")
    parser.add_argument("--name", required=True, help="Nome amigável do bot")
    parser.add_argument("--game", required=True, help="Jogo correspondente (ex.: Roblox)")
    parser.add_argument("--id", default="", help="Identificador único (ex.: roblox.game.bot)")
    parser.add_argument("--type", default="vision", help="Tipo de bot")
    parser.add_argument("--model", default="", help="Modelo inicial (.pt)")
    parser.add_argument("--target", default="target", help="Classe alvo a detectar")

    args = parser.parse_args()
    create_bot(args.name, args.game, args.id, args.type, args.model, args.target)
