import { Plugin, MarkdownRenderer, loadMathJax, MarkdownPostProcessorContext } from 'obsidian';
import { BlindFoldSettingTab } from './settings';

const BlindFoldCodeProcessor = (self: BlindFoldPlugin) => (source:string, el:HTMLElement, ctx:MarkdownPostProcessorContext) => {
  const closebutton = el.createEl("button", {text: self.settings.closeText, cls: ["btn", "blind"]});
  const openbutton = el.createEl("button", {text: self.settings.openText, cls: "btn"})
  closebutton.addEventListener("click", () => {
    container.toggleClass("blind", true) 
    closebutton.toggleClass("blind", true)
    openbutton.toggleClass("blind", false)
  })
  openbutton.addEventListener("click", () => {
    container.toggleClass("blind", false) 
    closebutton.toggleClass("blind", false)
    openbutton.toggleClass("blind", true)
  })

  const container = el.createDiv();
  container.toggleClass(["blindfold", "blind"], true);

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
