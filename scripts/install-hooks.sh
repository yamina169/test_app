#!/bin/sh
# Install git hooks (runs on npm install)
[ -d .git ] || exit 0
HOOKS_DIR=".git/hooks"
mkdir -p "$HOOKS_DIR"
cat > "$HOOKS_DIR/prepare-commit-msg" << 'EOF'
#!/bin/sh
# Remove Cursor co-author from commit messages
FILE=$1
if [ -f "$FILE" ]; then
  grep -v "Co-authored-by: Cursor <cursoragent@cursor.com>" "$FILE" > "${FILE}.tmp"
  mv "${FILE}.tmp" "$FILE"
fi
EOF
chmod +x "$HOOKS_DIR/prepare-commit-msg"
echo "Git hooks installed."
