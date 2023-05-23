import { App, PluginSettingTab, Setting } from 'obsidian';
import BlindFoldPlugin from './main'

export class BlindFoldSettingTab extends PluginSettingTab {
  plugin: BlindFoldPlugin

  constructor(app: App, plugin: BlindFoldPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display (): void {
    let { containerEl } = this;
    containerEl.empty()

    new Setting(containerEl)
      .setName("Open Text")
      .setDesc("a text displayed on the button to open the fold")
      .addText((text) => text
        .setPlaceholder("click here to reveal...")
        .setValue(this.plugin.settings.openText)
        .onChange(async (value) => {
          this.plugin.settings.openText = value 
          await this.plugin.saveSettings()
        })
      )

    new Setting(containerEl)
      .setName("Close Text")
      .setDesc("a text displayed on the button to close the fold")
      .addText((text) => text
        .setPlaceholder("click here to close...")
        .setValue(this.plugin.settings.closeText)
        .onChange(async (value) => {
          this.plugin.settings.closeText = value 
          await this.plugin.saveSettings()
        })
      )
  }
}
