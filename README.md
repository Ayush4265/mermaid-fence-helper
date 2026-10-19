# Mermaid Fence Helper

Adds `mermaid` immediately AFTER an opening backtick fence, producing ```mermaid. Closing fences remain unchanged.

## Install on Windows

1. Extract the ZIP.
2. In your Obsidian vault folder, open `.obsidian`, then `plugins` (create `plugins` if needed).
3. Copy the entire `mermaid-fence-helper` folder there. The files must be directly at `.obsidian/plugins/mermaid-fence-helper/main.js` and `manifest.json`, with no extra nested folder.
4. Restart Obsidian. Open **Settings → Community plugins**, enable community plugins if needed, then enable **Mermaid Fence Helper**.

No build step, Node installation, or paid service is needed.

## Use

Automatic mode is off by default for new installations. You can enable it in Settings → Mermaid Fence Helper. When enabled, pasting or editing a complete unlabeled code block starting with `flowchart TD`, `graph LR`, or another recognized Mermaid diagram declaration labels its opening fence automatically. Updating preserves your existing setting; turn it off in settings if it was previously enabled.

For existing notes: open the note in editing mode, press **Ctrl+P**, and choose **Mermaid Fence Helper: Add mermaid to diagram blocks in this note**.

If you want every unlabeled backtick block in the current note converted, use **Mermaid Fence Helper: Add mermaid to ALL unlabeled blocks in this note**. This also converts non-diagram blocks, so use it only in notes where that is intended. You can assign either command a shortcut under **Settings → Hotkeys**.

## Behavior and limits

- Only edits the current editor; does not scan or rewrite your whole vault.
- Preserves closing fences, content, line endings, and existing language labels.
- Handles multiple blocks, longer backtick fences, and blockquote/callout fences. Tilde blocks are tracked but not converted.
- Waits for a complete pair of fences. A lone opening fence is left unchanged.
- Automatic detection uses the first nonblank, non-comment line. Mermaid blocks with YAML configuration before their diagram declaration need the ALL command.
- Fences in list items with more than three leading spaces are not supported.
- Disable automatic mode in the plugin settings before undoing an automatic conversion; otherwise later edits can label it again.

Validated with automated parser and mocked Obsidian editor tests. Not tested inside a running Obsidian installation.

API reference: https://docs.obsidian.md/Plugins/Editor/Editor
