import { Plugin, renderMath, loadMathJax, Notice, finishRenderMath } from 'obsidian';

const render = (el: HTMLDivElement, text: string) => {
  text.split('$$').forEach((val, ind) => {
    let block = el.createEl("div")
    if (ind % 2 == 0) {
      val.split('$').forEach((val, ind) => {
        let word = block.createEl("span", { text: val })
        if (ind % 2 == 1) {
          word.replaceWith(renderMath(val, false)) 
        }
      })
    }
    if (ind % 2 == 1) {
      block.replaceWith(renderMath(val, true))
    }
  })
}

export default class SpoilerBlock extends Plugin {
  async onload() {

    await loadMathJax();

    this.registerMarkdownCodeBlockProcessor("blindfold", (source, el, _) => {

      const button = el.createEl("button");
      button.innerHTML = "click here to reveal..."; 
      button.addEventListener("click", () => {
        if (container.className === 'blindfold-blind') {
          container.className = "blindfold-show"
          button.innerHTML = "close"
        }
        else {
          container.className = 'blindfold-blind'
          button.innerHTML = "click here to reveal..."
        }
      })

      const container = el.createEl("div");
      container.className = "blindfold-blind";
      
      const rows = source.split("\n");
      for (let row of rows) {
        let rowEl = container.createEl("div")
        render(rowEl, row)
      }

      finishRenderMath();
      
    });
  }
}
