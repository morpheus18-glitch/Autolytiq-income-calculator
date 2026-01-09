#!/bin/bash
# Automated SQLite Database Backup Script
# Keeps last 7 daily backups with rotation

set -e

# Configuration
APP_DIR="/root/income-calculator-autolytiq"
BACKUP_DIR="$APP_DIR/backups"
DATA_DIR="$APP_DIR/data"
MAX_BACKUPS=7
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Backup each database
for db in "$DATA_DIR"/*.db; do
    if [ -f "$db" ]; then
        db_name=$(basename "$db" .db)
        backup_file="$BACKUP_DIR/${db_name}_${TIMESTAMP}.db"

        # Use SQLite's backup command for consistency
        sqlite3 "$db" ".backup '$backup_file'"

        # Compress the backup
        gzip "$backup_file"

        echo "Backed up: $db -> ${backup_file}.gz"
    fi
done

# Rotate old backups (keep last MAX_BACKUPS per database)
for db_name in app leads; do
    # Count backups for this database
    backup_count=$(ls -1 "$BACKUP_DIR"/${db_name}_*.db.gz 2>/dev/null | wc -l)

    if [ "$backup_count" -gt "$MAX_BACKUPS" ]; then
        # Remove oldest backups
        delete_count=$((backup_count - MAX_BACKUPS))
        ls -1t "$BACKUP_DIR"/${db_name}_*.db.gz | tail -n "$delete_count" | xargs rm -f
        echo "Rotated $delete_count old backup(s) for $db_name"
    fi
done

# Log backup completion
echo "[$(date)] Backup completed successfully" >> "$BACKUP_DIR/backup.log"

# Show current backups
echo ""
echo "Current backups:"
ls -lh "$BACKUP_DIR"/*.gz 2>/dev/null || echo "No backups yet"
