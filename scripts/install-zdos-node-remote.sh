#!/usr/bin/env bash
set -euo pipefail

REPO="${ZDOS_REPO:-https://github.com/high-cde/zdos-microcosm-beta.git}"
REF="${ZDOS_REF:-feat/zdos-vps-node}"
TMP_DIR="$(mktemp -d /tmp/zdos-node-install.XXXXXX)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

if [[ "${EUID}" -ne 0 ]]; then
  echo "Errore: esegui con sudo:" >&2
  echo "  sudo bash install-zdos-node-remote.sh" >&2
  exit 1
fi

command -v git >/dev/null || { echo "Errore: git non installato" >&2; exit 1; }
command -v node >/dev/null || { echo "Errore: Node.js 20+ non installato" >&2; exit 1; }
command -v npm >/dev/null || { echo "Errore: npm non installato" >&2; exit 1; }

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if (( NODE_MAJOR < 20 )); then
  echo "Errore: serve Node.js 20 o superiore; trovato $(node --version)" >&2
  exit 1
fi

printf 'Scarico ZDOS Node ref=%s...\n' "$REF"
git clone --depth 1 --branch "$REF" "$REPO" "$TMP_DIR/source" >/dev/null
cd "$TMP_DIR/source"

if [[ ! -f node/zdos-node.ts || ! -f scripts/install-zdos-node.sh ]]; then
  echo "Errore: la ref non contiene il runtime ZDOS Node." >&2
  exit 1
fi

bash scripts/install-zdos-node.sh

echo
echo "Installazione completata. Verifica:"
echo "  curl http://127.0.0.1:8787/health"
echo "  sudo systemctl status zdos-node"
echo
echo "Sicurezza: il nodo ascolta solo su 127.0.0.1 e radio TX resta DENIED."
