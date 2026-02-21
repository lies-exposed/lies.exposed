#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
CERT_DIR="$REPO_ROOT/_data/certs"
CERT_FILE="$CERT_DIR/liexp.dev.crt"
KEY_FILE="$CERT_DIR/liexp.dev.key"

mkdir -p "$CERT_DIR"

echo "==> Generating self-signed wildcard certificate for *.liexp.dev..."

openssl req \
    -newkey rsa:2048 \
    -x509 \
    -nodes \
    -keyout "$KEY_FILE" \
    -new \
    -out "$CERT_FILE" \
    -reqexts SAN \
    -extensions SAN \
    -config <(printf '
[req]
default_bits = 2048
prompt = no
default_md = sha256
x509_extensions = v3_req
distinguished_name = dn

[dn]
C = IT
ST = Milan
L = Milan
O = Lies Exposed
OU = Lies Exposed
emailAddress = hello@lies.exposed
CN = liexp.dev

[v3_req]
subjectAltName = @alt_names

[SAN]
subjectAltName = @alt_names

[alt_names]
DNS.1 = *.liexp.dev
DNS.2 = liexp.dev
') \
    -sha256 \
    -days 3650

echo "==> Certificate generated:"
echo "    Cert: $CERT_FILE"
echo "    Key:  $KEY_FILE"
openssl x509 -in "$CERT_FILE" -noout -subject -dates

# ─── Trust the certificate in Chrome / system ────────────────────────────────

OS="$(uname -s)"

if [ "$OS" = "Darwin" ]; then
    echo ""
    echo "==> macOS: Trusting certificate in system Keychain (Chrome uses it)..."
    sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$CERT_FILE"
    echo "    Done. Chrome will trust *.liexp.dev after restart."

elif [ "$OS" = "Linux" ]; then
    echo ""
    echo "==> Linux: Trusting certificate for Chrome (NSS database)..."

    # Install nss-tools if not present (certutil)
    if ! command -v certutil &>/dev/null; then
        echo "    certutil not found — installing nss-tools..."
        if command -v dnf &>/dev/null; then
            sudo dnf install -y nss-tools
        elif command -v apt-get &>/dev/null; then
            sudo apt-get install -y libnss3-tools
        else
            echo "    WARNING: Cannot install certutil automatically. Install nss-tools manually."
            exit 1
        fi
    fi

    # ── Helper: trust cert in a single NSS DB directory ──────────────────────
    trust_in_nss_db() {
        local db_dir="$1"
        local label="$2"
        mkdir -p "$db_dir"
        if [ ! -f "$db_dir/cert9.db" ]; then
            certutil -d "sql:$db_dir" -N --empty-password
        fi
        certutil -d "sql:$db_dir" -D -n "liexp.dev" 2>/dev/null || true
        certutil -d "sql:$db_dir" -A -t "CT,," -n "liexp.dev" -i "$CERT_FILE"
        echo "    Trusted in $label"
    }

    # Chrome / Chromium NSS DB
    NSS_DB="$HOME/.pki/nssdb"
    trust_in_nss_db "$NSS_DB" "Chrome (~/.pki/nssdb)"
    echo "    Restart Chrome for the change to take effect."

    # Firefox profiles — each profile has its own cert9.db
    FIREFOX_DIR="$HOME/.mozilla/firefox"
    if [ -d "$FIREFOX_DIR" ]; then
        echo ""
        echo "==> Linux: Trusting certificate in Firefox profiles..."
        for profile_dir in "$FIREFOX_DIR"/*/; do
            [ -f "${profile_dir}cert9.db" ] || continue
            profile_name="$(basename "$profile_dir")"
            trust_in_nss_db "$profile_dir" "Firefox ($profile_name)"
        done
        echo "    Restart Firefox for the change to take effect."
    fi

    # Also trust system-wide (for curl etc.)
    if command -v update-ca-trust &>/dev/null; then
        echo "==> Linux: Trusting certificate system-wide (update-ca-trust)..."
        sudo cp "$CERT_FILE" /etc/pki/ca-trust/source/anchors/liexp.dev.crt
        sudo update-ca-trust extract
        echo "    Done."
    elif command -v update-ca-certificates &>/dev/null; then
        echo "==> Linux: Trusting certificate system-wide (update-ca-certificates)..."
        sudo cp "$CERT_FILE" /usr/local/share/ca-certificates/liexp.dev.crt
        sudo update-ca-certificates
        echo "    Done."
    fi
fi

echo ""
echo "==> All done! Make sure nginx is reloaded:"
echo "    docker compose -f compose.reverse-proxy.yml up -d reverseproxy.dev"
