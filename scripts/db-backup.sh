#!/usr/bin/env bash
#
# scripts/db-backup.sh
#
# Dumps a database to backups/ and then VERIFIES the dump by restoring it into a
# scratch database and comparing row counts table by table.
#
# The verification is the point. A dump that was written but never read back is
# not a backup, it is a file — and the failure mode is silent: mysqldump exits 0
# having written a truncated or empty dump often enough that checking matters.
#
# Usage:
#   npm run db:backup                 # the local database in .env.local
#   ./scripts/db-backup.sh prod       # production, over SSH (read-only)
#
# Backups are gitignored: they contain real enquiry data.

set -euo pipefail

TARGET="${1:-local}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DIR"

# --- produce the dump ---------------------------------------------------------

if [ "$TARGET" = "local" ]; then
  DB="islandhype"
  OUT="$DIR/islandhype-local-$STAMP.sql.gz"
  echo "Dumping local $DB ..."
  mysqldump --single-transaction --routines --triggers --events \
    --default-character-set=utf8mb4 --hex-blob --set-gtid-purged=OFF \
    -h 127.0.0.1 -P 3306 -u root "$DB" | gzip > "$OUT"

elif [ "$TARGET" = "prod" ]; then
  # Read-only: dumps on the server and streams the bytes back here. Nothing is
  # written to the server and nothing on it is modified.
  : "${PROD_SSH:=root@68.183.39.8}"
  : "${PROD_DB:=islandhype}"
  OUT="$DIR/islandhype-prod-$STAMP.sql.gz"
  echo "Dumping $PROD_DB on $PROD_SSH ..."
  # The password is read from the server's own environment, never passed on the
  # command line, where it would be visible in that box's process list.
  ssh "$PROD_SSH" \
    "mysqldump --single-transaction --routines --triggers --events \
       --default-character-set=utf8mb4 --hex-blob --set-gtid-purged=OFF \
       '$PROD_DB' | gzip -c" > "$OUT"

else
  echo "Unknown target '$TARGET'. Use 'local' or 'prod'." >&2
  exit 1
fi

if [ ! -s "$OUT" ]; then
  echo "FAILED: the dump is empty. Not keeping it." >&2
  rm -f "$OUT"
  exit 1
fi

gzip -t "$OUT"
SIZE="$(du -h "$OUT" | cut -f1)"
TABLES="$(gunzip -c "$OUT" | grep -c '^CREATE TABLE' || true)"
echo "  wrote $OUT  ($SIZE, $TABLES tables)"

if [ "$TABLES" -eq 0 ]; then
  echo "FAILED: the dump contains no tables. Not keeping it." >&2
  rm -f "$OUT"
  exit 1
fi

# --- verify it by restoring ---------------------------------------------------
#
# Only for the local target: verifying a prod dump means restoring it somewhere,
# and the only MySQL this script can be sure of is the local one. Restoring a
# prod dump into the local server would overwrite the working database, so that
# is left as a deliberate manual step.

if [ "$TARGET" != "local" ]; then
  echo "  skipping restore check for '$TARGET' (would need a scratch server)."
  echo "  To verify by hand, restore it into a throwaway database and compare counts."
  exit 0
fi

VERIFY="islandhype_verify_$$"
echo "Verifying by restoring into $VERIFY ..."
cleanup() { mysql -h 127.0.0.1 -u root -e "DROP DATABASE IF EXISTS \`$VERIFY\`;" 2>/dev/null || true; }
trap cleanup EXIT

mysql -h 127.0.0.1 -u root -e \
  "DROP DATABASE IF EXISTS \`$VERIFY\`; CREATE DATABASE \`$VERIFY\` CHARACTER SET utf8mb4;"
gunzip -c "$OUT" | mysql -h 127.0.0.1 -u root "$VERIFY"

FAILED=0
while read -r tbl; do
  [ -z "$tbl" ] && continue
  a="$(mysql -h 127.0.0.1 -u root -N -B -e "SELECT COUNT(*) FROM \`$DB\`.\`$tbl\`")"
  b="$(mysql -h 127.0.0.1 -u root -N -B -e "SELECT COUNT(*) FROM \`$VERIFY\`.\`$tbl\`")"
  if [ "$a" != "$b" ]; then
    printf "  MISMATCH %-24s live=%s restored=%s\n" "$tbl" "$a" "$b"
    FAILED=1
  fi
done < <(mysql -h 127.0.0.1 -u root -N -B -e \
  "SELECT TABLE_NAME FROM information_schema.TABLES
    WHERE TABLE_SCHEMA='$DB' AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME;")

if [ "$FAILED" -ne 0 ]; then
  echo "FAILED: the restored copy does not match. Treat $OUT as unreliable." >&2
  exit 1
fi

echo "  verified: every table restored with matching row counts."
echo
echo "Restore this backup with:"
echo "  gunzip -c $OUT | mysql -h 127.0.0.1 -u root $DB"
