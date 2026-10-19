const { Plugin, PluginSettingTab, Setting, Notice } = require('obsidian');

// Parse pairs rather than replacing every occurrence of three backticks.
function findInsertions(text, onlyDiagrams = false) {
  const lines = text.split('\n');
  const changes = [];
  let open = null;
  let inFrontmatter = false;
  for (let line = 0; line < lines.length; line++) {
    const raw = lines[line].replace(/\r$/, '');
    if (line === 0 && raw.replace(/^\uFEFF/, '') === '---') { inFrontmatter = true; continue; }
    if (inFrontmatter) { if (/^(---|\.\.\.)\s*$/.test(raw)) inFrontmatter = false; continue; }
    // Supports ordinary fences and fences inside blockquotes/callouts.
    const content = raw.replace(/^(?: {0,3}>[ \t]?)+/, '');
    const match = /^( {0,3})(`{3,}|~{3,})(.*)$/.exec(content);
    if (open) {
      if (match && match[2][0] === open.char && match[2].length >= open.length && /^\s*$/.test(match[3])) {
        if (open.bare && (!onlyDiagrams || looksLikeMermaid(lines.slice(open.line + 1, line)))) {
          changes.push({ from: { line: open.line, ch: open.ch }, text: 'mermaid' });
        }
        open = null;
      }
      continue;
    }
    if (!match || (match[2][0] === '`' && match[3].includes('`'))) continue;
    open = {
      line, char: match[2][0], length: match[2].length,
      bare: match[2][0] === '`' && /^\s*$/.test(match[3]),
      ch: raw.length - match[3].length
    };
  }
  // Leave unfinished fences alone until a closing fence exists.
  return changes;
}

function looksLikeMermaid(lines) {
  for (const line of lines) {
    const text = line.replace(/^(?: {0,3}>[ \t]?)+/, '').trim();
    if (!text || text.startsWith('%%')) continue;
    return /^(?:(?:flowchart|graph)\s+(?:TB|TD|BT|RL|LR)\b|sequenceDiagram\b|classDiagram\b|stateDiagram(?:-v2)?\b|erDiagram\b|journey\b|gantt\b|pie\b|mindmap\b|timeline\b|gitGraph\b|quadrantChart\b|requirementDiagram\b|(?:C4Context|C4Container|C4Component|C4Dynamic|C4Deployment)\b|(?:xychart|block|packet|architecture|kanban|sankey|radar|treemap)(?:-beta)?\b)/.test(text);
  }
  return false;
}

class MermaidFenceHelper extends Plugin {
  async onload() {
    this.settings = Object.assign({ automatic: false }, await this.loadData());
    this.applying = false;
    this.addCommand({
      id: 'label-diagrams', name: 'Add mermaid to diagram blocks in this note',
      editorCallback: editor => this.convert(editor, true, true)
    });
    this.addCommand({
      id: 'label-all', name: 'Add mermaid to ALL unlabeled blocks in this note',
      editorCallback: editor => this.convert(editor, false, true)
    });
    this.registerEvent(this.app.workspace.on('editor-change', editor => {
      if (this.settings.automatic && !this.applying) this.convert(editor, true, false);
    }));
    this.addSettingTab(new HelperSettings(this.app, this));
  }
  convert(editor, onlyDiagrams, notify) {
    if (this.applying) return;
    const changes = findInsertions(editor.getValue(), onlyDiagrams);
    if (changes.length) {
      this.applying = true;
      try { editor.transaction({ changes }); }
      finally { this.applying = false; }
    }
    if (notify) new Notice(changes.length ? `Labeled ${changes.length} opening fence(s).` : 'No matching unlabeled blocks found.');
  }
}

class HelperSettings extends PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    this.containerEl.empty();
    new Setting(this.containerEl)
      .setName('Automatically label Mermaid diagrams')
      .setDesc('While editing or pasting, label complete unlabeled blocks that start with a recognized Mermaid diagram declaration. Closing fences and existing language labels stay unchanged. Disable this to freely undo automatic changes.')
      .addToggle(toggle => toggle.setValue(this.plugin.settings.automatic).onChange(async value => {
        this.plugin.settings.automatic = value;
        await this.plugin.saveData(this.plugin.settings);
      }));
  }
}

module.exports = MermaidFenceHelper;
module.exports.findInsertions = findInsertions;
