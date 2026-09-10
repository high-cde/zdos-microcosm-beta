#!/usr/bin/env bash
set -euo pipefail

PREFIX="${ZDOS_PREFIX:-/opt/zdos-node}"
DATA_DIR="${ZDOS_DATA_DIR:-/var/lib/zdos-node}"
SERVICE="/etc/systemd/system/zdos-node.service"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash scripts/install-zdos-node.sh" >&2
  exit 1
fi

install -d -m 0755 "$PREFIX" "$DATA_DIR"
install -m 0755 node/zdos-node.ts "$PREFIX/zdos-node.ts"
cat > "$PREFIX/package.json" <<'JSON'
{"type":"module","dependencies":{"tsx":"^4.21.0"}}
JSON
npm install --prefix "$PREFIX" --omit=dev --no-fund --no-audit >/dev/null
id -u zdos-node >/dev/null 2>&1 || useradd --system --home-dir "$DATA_DIR" --shell /usr/sbin/nologin zdos-node
chown -R zdos-node:zdos-node "$PREFIX" "$DATA_DIR"
cat > "$SERVICE" <<EOF
[Unit]
Description=ZDOS headless local node
After=network.target

[Service]
Type=simple
User=zdos-node
Group=zdos-node
WorkingDirectory=$PREFIX
Environment=NODE_ENV=production
Environment=ZDOS_DATA_DIR=$DATA_DIR
Environment=ZDOS_NODE_HOST=127.0.0.1
Environment=ZDOS_NODE_PORT=8787
ExecStart=/usr/bin/env npx --prefix $PREFIX tsx $PREFIX/zdos-node.ts
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$DATA_DIR
RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now zdos-node
systemctl --no-pager --full status zdos-node || true
printf '\nInstalled ZDOS Node at %s\nData: %s\nLocal health: curl http://127.0.0.1:8787/health\n' "$PREFIX" "$DATA_DIR"
