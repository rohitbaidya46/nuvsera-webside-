#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Nuvsera Technology — one-command VPS installer (Ubuntu 22.04/24.04, Debian 12)
#
#   curl -fsSL https://raw.githubusercontent.com/rohitbaidya46/nuvsera-webside-/main/deploy/install.sh -o install.sh
#   sudo bash install.sh
#
# Installs Docker, downloads the website, creates secure settings, starts:
#   website + PostgreSQL + automatic HTTPS (Caddy) + scheduled jobs + nightly DB backups,
# and enables a firewall (SSH, HTTP, HTTPS only). Safe to re-run: existing settings are kept.
# Optional environment variables: DOMAIN, ADMIN_EMAIL, REPO_URL, INSTALL_DIR, NONINTERACTIVE=1, SKIP_FIREWALL=1
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/rohitbaidya46/nuvsera-webside-.git}"
INSTALL_DIR="${INSTALL_DIR:-/opt/nuvsera}"
GREEN=$'\e[32m'; YELLOW=$'\e[33m'; RED=$'\e[31m'; BOLD=$'\e[1m'; RESET=$'\e[0m'
step() { echo; echo "${BOLD}▶ $*${RESET}"; }
ok() { echo "${GREEN}✔ $*${RESET}"; }
warn() { echo "${YELLOW}⚠ $*${RESET}"; }
die() { echo "${RED}✘ $*${RESET}" >&2; exit 1; }
ask() { # ask "Question" default → reads from the terminal even when piped
  local q="$1" def="${2:-}" ans=""
  if [ "${NONINTERACTIVE:-0}" = 1 ]; then echo "$def"; return; fi
  read -r -p "$q${def:+ [$def]}: " ans </dev/tty || true
  echo "${ans:-$def}"
}

[ "$(id -u)" = 0 ] || die "Please run as root:  sudo bash install.sh"
command -v apt-get >/dev/null || die "This installer supports Ubuntu/Debian. For other systems see README section 4."

echo "${BOLD}Nuvsera Technology — server installer${RESET}"

# ── 1. Questions ──
EXISTING_ENV="$INSTALL_DIR/.env"
if [ -f "$EXISTING_ENV" ]; then
  DOMAIN="$(grep -E '^DOMAIN=' "$EXISTING_ENV" | cut -d= -f2- | tr -d '"')"
  ok "Existing installation found for $DOMAIN — settings will be kept."
else
  DOMAIN="${DOMAIN:-$(ask "Your domain (without https://)" "nuvseratechnology.com")}"
  DOMAIN="${DOMAIN#http://}"; DOMAIN="${DOMAIN#https://}"; DOMAIN="${DOMAIN%%/*}"; DOMAIN="${DOMAIN#www.}"
  ADMIN_EMAIL="${ADMIN_EMAIL:-$(ask "Email for the first admin login (also used for HTTPS certificate notices)" "admin@$DOMAIN")}"
  [[ "$DOMAIN" =~ ^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$|^localhost$ ]] || die "That doesn't look like a domain: $DOMAIN"
  [[ "$ADMIN_EMAIL" =~ ^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$ ]] || die "That doesn't look like an email address: $ADMIN_EMAIL"
fi

# ── 2. System packages, swap, Docker ──
step "Installing system packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq ca-certificates curl git openssl >/dev/null
ok "Packages ready"

MEM_MB=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
if [ "$MEM_MB" -lt 3000 ] && [ "$(swapon --show | wc -l)" -eq 0 ] && [ ! -f /swapfile ]; then
  step "Adding 2 GB swap (server has ${MEM_MB} MB RAM; building the site needs more)"
  fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=none
  chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  ok "Swap enabled"
fi

if ! command -v docker >/dev/null || ! docker compose version >/dev/null 2>&1; then
  step "Installing Docker"
  curl -fsSL https://get.docker.com | sh >/dev/null
  systemctl enable --now docker >/dev/null 2>&1 || true
fi
docker info >/dev/null 2>&1 || die "Docker is installed but not running. Try: systemctl start docker"
ok "Docker $(docker --version | awk '{print $3}' | tr -d ,) ready"

# ── 3. Download / update the website code ──
step "Downloading the website code"
if [ -d "$INSTALL_DIR/.git" ]; then
  git -C "$INSTALL_DIR" pull --ff-only -q || die "Could not update the code in $INSTALL_DIR (local changes?)."
else
  mkdir -p "$(dirname "$INSTALL_DIR")"
  if ! git clone -q "$REPO_URL" "$INSTALL_DIR"; then
    die "Could not download $REPO_URL.
   If the GitHub repository is private, create a token (GitHub → Settings → Developer settings →
   Fine-grained tokens → read-only 'Contents' access to this repository) and run:
   REPO_URL=https://<TOKEN>@github.com/rohitbaidya46/nuvsera-webside-.git sudo -E bash install.sh"
  fi
fi
cd "$INSTALL_DIR"
ok "Code in $INSTALL_DIR ($(git rev-parse --short HEAD))"

# ── 4. Detect an existing website on this server (never disturb it) ──
port_owner() { ss -Htlnp "sport = :$1" 2>/dev/null | grep -oP 'users:\(\("\K[^"]+' | head -1 || true; }
port_free() { [ -z "$(ss -Htln "sport = :$1" 2>/dev/null)" ]; }
if [ -f .env ]; then
  WEB_MODE="$(grep -E '^WEB_MODE=' .env | cut -d= -f2- || true)"; WEB_MODE="${WEB_MODE:-caddy}"
  APP_PORT="$(grep -E '^APP_PORT=' .env | cut -d= -f2- || true)"; APP_PORT="${APP_PORT:-3000}"
else
  step "Checking for other websites on this server"
  OWNER80="$(port_owner 80)"; OWNER443="$(port_owner 443)"
  case "${WEB_MODE:-auto}:${OWNER80:-$OWNER443}" in
    auto:) WEB_MODE=caddy ;;
    auto:nginx) WEB_MODE=nginx ;;
    auto:apache2|auto:httpd) WEB_MODE=apache ;;
    auto:*) WEB_MODE=manual ;;
  esac
  APP_PORT=3000
  while ! port_free "$APP_PORT"; do APP_PORT=$((APP_PORT + 1)); [ "$APP_PORT" -gt 3099 ] && die "No free port between 3000 and 3099."; done
  case "$WEB_MODE" in
    caddy) ok "Ports 80/443 are free — a dedicated HTTPS web server (Caddy) will be installed." ;;
    nginx|apache) ok "Existing $WEB_MODE web server found — the new site will be ADDED to it; existing sites are not changed." ;;
    manual) warn "Ports 80/443 are used by '${OWNER80:-$OWNER443}'. They will NOT be touched; the site will run on 127.0.0.1:$APP_PORT and the summary explains the last step." ;;
  esac
fi
[ "$WEB_MODE" = caddy ] && COMPOSE_FILES="docker-compose.yml:deploy/docker-compose.prod.yml" || COMPOSE_FILES="docker-compose.yml"

# ── 5. Settings (.env) with fresh secrets ──
if [ ! -f .env ]; then
  step "Creating secure settings"
  ADMIN_PASSWORD="Nv-$(openssl rand -base64 18 | tr -dc 'A-Za-z0-9' | head -c 16)!7a"
  cat > .env <<EOF
# Generated by deploy/install.sh on $(date -u +%Y-%m-%dT%H:%MZ). Keep this file private.
COMPOSE_PROJECT_NAME=nuvsera
COMPOSE_FILE=$COMPOSE_FILES
WEB_MODE=$WEB_MODE
APP_PORT=$APP_PORT
DOMAIN=$DOMAIN
ACME_EMAIL=$ADMIN_EMAIL
APP_URL=https://$DOMAIN
SITE_INDEXABLE=true
APP_SECRET=$(openssl rand -base64 48 | tr -d '\n/+=')
ENCRYPTION_KEY=$(openssl rand -hex 32)
CRON_SECRET=$(openssl rand -hex 24)
POSTGRES_PASSWORD=$(openssl rand -hex 24)
STORAGE_DRIVER=local
UPLOAD_DIR=/data/uploads
BACKUP_RETENTION_DAYS=30
SEED_ADMIN_EMAIL=$ADMIN_EMAIL
SEED_ADMIN_PASSWORD=$ADMIN_PASSWORD
# Optional — add later, then run: sudo bash deploy/update.sh
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=
HCAPTCHA_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
EOF
  chmod 600 .env
  ok "Settings saved to $INSTALL_DIR/.env (readable by root only)"
fi
mkdir -p backups && chmod 700 backups

# ── 6. DNS check (warning only) ──
DNS_OK=0
if [ "$DOMAIN" != "localhost" ]; then
  step "Checking that $DOMAIN points to this server"
  SERVER_IP="$(curl -4 -fsS --max-time 8 https://api.ipify.org 2>/dev/null || true)"
  DOMAIN_IP="$(getent ahostsv4 "$DOMAIN" 2>/dev/null | awk 'NR==1{print $1}' || true)"
  if [ -n "$SERVER_IP" ] && [ "$SERVER_IP" = "$DOMAIN_IP" ]; then
    DNS_OK=1
    ok "$DOMAIN → $SERVER_IP"
  else
    warn "$DOMAIN points to '${DOMAIN_IP:-nothing}', but this server is '${SERVER_IP:-unknown}'."
    warn "At your domain registrar, create an A record:  @ → ${SERVER_IP:-<server IP>}   and   www → ${SERVER_IP:-<server IP>}"
    if [ "${WEB_MODE:-caddy}" = caddy ]; then
      warn "The site will start now; HTTPS activates automatically once DNS is correct (can take up to a few hours)."
    else
      warn "The site will start now; once DNS is correct, enable HTTPS with the command shown at the end."
    fi
  fi
fi

# ── 7. Firewall (only when this server is dedicated to the site; never when other apps run here) ──
if [ "$WEB_MODE" = caddy ] && [ "${SKIP_FIREWALL:-0}" != 1 ] && { command -v ufw >/dev/null 2>&1 || apt-get install -y -qq ufw >/dev/null 2>&1; }; then
  step "Configuring firewall (SSH, HTTP, HTTPS)"
  ufw allow OpenSSH >/dev/null 2>&1 || ufw allow 22/tcp >/dev/null
  ufw allow 80/tcp >/dev/null && ufw allow 443/tcp >/dev/null && ufw allow 443/udp >/dev/null
  ufw --force enable >/dev/null && ok "Firewall active"
fi

# ── 8. Build and start ──
step "Building the website (first time takes 5–10 minutes)"
docker compose build --quiet
step "Preparing the database"
docker compose up -d db >/dev/null
docker compose --profile tools run --rm migrate
step "Starting all services"
docker compose up -d --remove-orphans
sleep 5
for i in $(seq 1 30); do
  docker compose exec -T app wget -qO- http://127.0.0.1:3000/robots.txt >/dev/null 2>&1 && break
  sleep 2
done
docker compose exec -T app wget -qO- http://127.0.0.1:3000/robots.txt >/dev/null 2>&1 || die "The website did not start. See: docker compose logs app"
ok "All services running"
docker compose ps --format 'table {{.Service}}\t{{.Status}}'

# ── 9. Connect the domain through an existing web server (nginx / apache modes) ──
HTTPS_NOTE=""
site_conflict() { grep -RlsiE "(server_name|ServerName|ServerAlias)[^;]*[[:space:]](www\.)?${DOMAIN//./\\.}([[:space:];]|$)" "$@" 2>/dev/null | grep -v nuvsera | head -1 || true; }
get_cert() { # $1 = nginx|apache
  if [ "$DNS_OK" != 1 ]; then
    HTTPS_NOTE="HTTPS not enabled yet (domain does not point here). After fixing DNS, run:  certbot --$1 -d $DOMAIN -d www.$DOMAIN"
    return
  fi
  apt-get install -y -qq certbot "python3-certbot-$1" >/dev/null
  certbot "--$1" -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$(grep -E '^ACME_EMAIL=' .env | cut -d= -f2-)" --redirect >/dev/null 2>&1 \
    || certbot "--$1" -d "$DOMAIN" --non-interactive --agree-tos -m "$(grep -E '^ACME_EMAIL=' .env | cut -d= -f2-)" --redirect >/dev/null 2>&1 \
    || { HTTPS_NOTE="Could not obtain the HTTPS certificate automatically. Run:  certbot --$1 -d $DOMAIN -d www.$DOMAIN"; return; }
  ok "HTTPS certificate installed (renews automatically)"
}
if [ "$WEB_MODE" = nginx ]; then
  step "Adding $DOMAIN to the existing nginx (other sites untouched)"
  CONF_DIR=/etc/nginx/sites-available; [ -d "$CONF_DIR" ] || CONF_DIR=/etc/nginx/conf.d
  CONF="$CONF_DIR/nuvsera.conf"
  if [ ! -f "$CONF" ]; then
    OTHER="$(site_conflict /etc/nginx)"
    [ -n "$OTHER" ] && die "nginx already has a site for $DOMAIN in $OTHER — not changing it. Send this message to your developer."
    # Listen on IPv6 only when the server has it AND existing sites already use it.
    IPV6_LISTEN=""
    if [ -e /proc/net/if_inet6 ] && grep -RqsE 'listen[[:space:]]+\[::\]' /etc/nginx; then IPV6_LISTEN="listen [::]:80;"; fi
    cat > "$CONF" <<NGINX
# Nuvsera Technology website — added by deploy/install.sh
server {
    listen 80;
    $IPV6_LISTEN
    server_name $DOMAIN www.$DOMAIN;
    client_max_body_size 12m;
    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
    }
}
NGINX
    [ "$CONF_DIR" = /etc/nginx/sites-available ] && ln -sf "$CONF" /etc/nginx/sites-enabled/nuvsera.conf
    if ! NGINX_TEST="$(nginx -t 2>&1)"; then
      rm -f "$CONF" /etc/nginx/sites-enabled/nuvsera.conf
      die "nginx rejected the new site configuration, so it was removed again — your other sites are unchanged. nginx said:
$NGINX_TEST"
    fi
    systemctl reload nginx 2>/dev/null || nginx -s reload
    ok "nginx now serves $DOMAIN (existing sites unchanged)"
  fi
  get_cert nginx
elif [ "$WEB_MODE" = apache ]; then
  step "Adding $DOMAIN to the existing Apache (other sites untouched)"
  CONF=/etc/apache2/sites-available/nuvsera.conf
  if [ ! -f "$CONF" ]; then
    OTHER="$(site_conflict /etc/apache2)"
    [ -n "$OTHER" ] && die "Apache already has a site for $DOMAIN in $OTHER — not changing it. Send this message to your developer."
    a2enmod -q proxy proxy_http headers >/dev/null
    cat > "$CONF" <<APACHE
# Nuvsera Technology website — added by deploy/install.sh
<VirtualHost *:80>
    ServerName $DOMAIN
    ServerAlias www.$DOMAIN
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:$APP_PORT/
    ProxyPassReverse / http://127.0.0.1:$APP_PORT/
    RequestHeader set X-Forwarded-Proto expr=%{REQUEST_SCHEME}
    LimitRequestBody 12582912
</VirtualHost>
APACHE
    a2ensite -q nuvsera >/dev/null
    if ! APACHE_TEST="$(apachectl configtest 2>&1)"; then
      a2dissite -q nuvsera >/dev/null; rm -f "$CONF"
      die "Apache rejected the new site configuration, so it was removed again — your other sites are unchanged. Apache said:
$APACHE_TEST"
    fi
    systemctl reload apache2 2>/dev/null || apachectl graceful
    ok "Apache now serves $DOMAIN (existing sites unchanged)"
  fi
  get_cert apache
fi

# ── 8. Summary ──
echo
echo "${GREEN}${BOLD}══════════════════════════════════════════════════════════${RESET}"
echo "${GREEN}${BOLD}  Nuvsera Technology website is installed${RESET}"
echo "${GREEN}${BOLD}══════════════════════════════════════════════════════════${RESET}"
if [ "$WEB_MODE" = manual ]; then
  echo "${YELLOW}  The site is running privately on http://127.0.0.1:$APP_PORT (ports 80/443 were left alone).${RESET}"
  echo "${YELLOW}  Last step: your existing web server must forward $DOMAIN to that address.${RESET}"
  echo "${YELLOW}  Send a screenshot of this message to your developer.${RESET}"
fi
[ -n "$HTTPS_NOTE" ] && echo "${YELLOW}  $HTTPS_NOTE${RESET}"
echo "  Website:      https://$DOMAIN"
echo "  Admin panel:  https://$DOMAIN/admin"
SEED_EMAIL="$(grep -E '^SEED_ADMIN_EMAIL=' .env | cut -d= -f2-)"
SEED_PASS="$(grep -E '^SEED_ADMIN_PASSWORD=' .env | cut -d= -f2-)"
if [ -n "$SEED_PASS" ]; then
  echo "  Admin email:  $SEED_EMAIL"
  echo "  Temporary password:  ${BOLD}$SEED_PASS${RESET}"
  echo "  → On first sign-in you'll set up 2FA and must choose a new password."
  echo "    (Already signed in before? Ignore this — your own password is unchanged.)"
fi
echo
echo "  Code & settings:  $INSTALL_DIR   (settings: $INSTALL_DIR/.env — back up ENCRYPTION_KEY)"
echo "  Update later:     sudo bash $INSTALL_DIR/deploy/update.sh"
echo "  View logs:        cd $INSTALL_DIR && sudo docker compose logs -f app"
echo "  DB backups:       $INSTALL_DIR/backups (nightly)  — copy them off the server regularly"
echo
