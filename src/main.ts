import { Plugin, MarkdownRenderer, loadMathJax, MarkdownPostProcessorContext } from 'obsidian';
import { BlindFoldSettingTab } from './settings';
import {
  PluginValue,
  EditorView,
  ViewPlugin,
  Decoration,
  DecorationSet,
  WidgetType,
} from "@codemirror/view";
import {
  Extension,
  StateField,
  Transaction,
} from "@codemirror/state";
import { RegExpCursor } from '@codemirror/search';
import { RangeSetBuilder } from "@codemirror/state";

const BlindFoldCodeProcessor = (self: BlindFoldPlugin) => (source:string, el:HTMLElement, ctx:MarkdownPostProcessorContext) => {

  const codeblockArg = ctx.getSectionInfo(el)?.text.split('\n')[0].trim().split(' ').slice(1).join(' ')

  const openText = codeblockArg ?? self.settings.openText
  const closeText = self.settings.closeText

  const closebutton = el.createEl("button", {text: closeText, cls: ["btn", "blind"]});
  const openbutton = el.createEl("button", {text: openText, cls: "btn"})
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
  enableSpoiler: boolean,
  openText: string,
  closeText: string
}

const DEFAULT_SETTINGS: BlindFoldSettings = {
  enableSpoiler: true,
  openText: "Open",
  closeText: "Close"
}

export class SpoilerWidget extends WidgetType {

  text = ""
  constructor (s: string) {
	super()
    this.text = s
  }

  toDOM(view: EditorView): HTMLElement {
    const div = document.createElement("span");
	div.createEl("span", {text: this.text})
	div.addEventListener("click", () => {
      div.toggleClass("spoiler-blind", !div.hasClass("spoiler-blind")) 
	})

    div.toggleClass("spoiler", true) 
    div.toggleClass("spoiler-blind", true) 

    return div;
  }
}

class SpoilerPlugin implements PluginValue { }
const spoilerPlugin = ViewPlugin.fromClass(SpoilerPlugin);

export const spoilerField = StateField.define<DecorationSet>({
  create(state): DecorationSet {
    return Decoration.none;
  },
  update(oldState: DecorationSet, transaction: Transaction): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();

	const find = new RegExpCursor(transaction.state.doc, "\\|%\s*(.*?)\s*%\\|")
	while (!find.next().done) {

	  builder.add(
		find.value.from, find.value.to,
		Decoration.replace({
		  widget: new SpoilerWidget(find.value.match[1]),
		})
	  );

	}

    return builder.finish();
  },
  provide(field: StateField<DecorationSet>): Extension {
    return EditorView.decorations.from(field);
  },
});

export default class BlindFoldPlugin extends Plugin {
  settings: BlindFoldSettings

  async onload() {
    await this.loadSettings();
    await loadMathJax();
    this.registerMarkdownCodeBlockProcessor("blindfold", BlindFoldCodeProcessor(this))
	if (this.settings.enableSpoiler)
      this.registerEditorExtension([spoilerPlugin, spoilerField])
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
