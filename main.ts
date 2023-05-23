import { Plugin, MarkdownRenderer, loadMathJax, MarkdownPostProcessorContext } from 'obsidian';
import { BlindFoldSettingTab } from 'settings';

const BlindFoldCodeProcessor = (self: BlindFoldPlugin) => (source:string, el:HTMLElement, ctx:MarkdownPostProcessorContext) => {
  const button = el.createEl("button");
  button.innerHTML = self.settings.openText; 
  button.addEventListener("click", () => {
    if (container.className === 'blindfold-blind') {
      container.className = "blindfold-show"
      button.innerHTML = self.settings.closeText
    }
    else {
      container.className = 'blindfold-blind'
      button.innerHTML = self.settings.openText
    }
  })

  const container = el.createDiv();
  container.className = "blindfold-blind";

  let rowEl = container.createDiv()
  MarkdownRenderer.renderMarkdown(source, rowEl, ctx.sourcePath, self)
}

interface BlindFoldSettings {
  openText: string,
  closeText: string
}

const DEFAULT_SETTINGS: BlindFoldSettings = {
  openText: "click here to reveal...",
  closeText: "Close"
}

export default class BlindFoldPlugin extends Plugin {
  settings: BlindFoldSettings

  async onload() {
    await this.loadSettings();
    await loadMathJax();
    this.registerMarkdownCodeBlockProcessor("blindfold", BlindFoldCodeProcessor(this))
    this.addSettingTab(new BlindFoldSettingTab(this.app, this))
  }

  onunload() { }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}
