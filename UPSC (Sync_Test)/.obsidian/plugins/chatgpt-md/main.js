/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  ChatTemplates: () => ChatTemplates,
  default: () => ChatGPT_MD
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  apiKey: "default",
  defaultChatFrontmatter: "---\nsystem_commands: ['I am a helpful assistant.']\ntemperature: 0\ntop_p: 1\nmax_tokens: 300\npresence_penalty: 1\nfrequency_penalty: 1\nstream: true\nstop: null\nn: 1\nmodel: gpt-3.5-turbo\n---",
  stream: true,
  streamSpeed: 28,
  chatTemplateFolder: "ChatGPT_MD/templates",
  chatFolder: "ChatGPT_MD/chats"
};
function getDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
var ChatGPT_MD = class extends import_obsidian.Plugin {
  async callOpenAIAPI(editor, messages, model = "gpt-3.5-turbo", max_tokens = 250, temperature = 0.3, top_p = 1, presence_penalty = 0.5, frequency_penalty = 0.5, stream = true, stop = null, n = 1, logit_bias = null, user = null) {
    try {
      console.log("calling openai api");
      const responseUrl = await (0, import_obsidian.requestUrl)({
        url: `https://api.openai.com/v1/chat/completions`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.settings.apiKey}`,
          "Content-Type": "application/json"
        },
        contentType: "application/json",
        body: JSON.stringify({
          model,
          messages,
          max_tokens,
          temperature,
          top_p,
          presence_penalty,
          frequency_penalty,
          stream,
          stop,
          n
          // logit_bias: logit_bias, // not yet supported
          // user: user, // not yet supported
        }),
        throw: false
      });
      try {
        const json = responseUrl.json;
        if (json && json.error) {
          new import_obsidian.Notice(`[ChatGPT MD] Error :: ${json.error.message}`);
          throw new Error(JSON.stringify(json.error));
        }
      } catch (err) {
        if (err instanceof SyntaxError) {
        } else {
          throw new Error(err);
        }
      }
      const response = responseUrl.text;
      if (stream) {
        const responseLines = response.split("\n\n");
        if (responseLines.length == 0) {
          throw new Error("[ChatGPT MD] no response");
        }
        for (let i = 0; i < responseLines.length; i++) {
          responseLines[i] = responseLines[i].split("data: ")[1];
        }
        const newLine = `

<hr class="__chatgpt_plugin">

role::assistant

`;
        editor.replaceRange(newLine, editor.getCursor());
        const cursor = editor.getCursor();
        const newCursor = {
          line: cursor.line,
          ch: cursor.ch + newLine.length
        };
        editor.setCursor(newCursor);
        let fullstr = "";
        for (const responseLine of responseLines) {
          if (responseLine && !responseLine.includes("[DONE]")) {
            const responseJSON = JSON.parse(responseLine);
            const delta = responseJSON.choices[0].delta.content;
            if (delta) {
              const cursor2 = editor.getCursor();
              if (delta === "`") {
                editor.replaceRange(delta, cursor2);
                await new Promise((r) => setTimeout(r, 82));
              } else {
                editor.replaceRange(delta, cursor2);
                await new Promise(
                  (r) => setTimeout(r, this.settings.streamSpeed)
                );
              }
              const newCursor2 = {
                line: cursor2.line,
                ch: cursor2.ch + delta.length
              };
              editor.setCursor(newCursor2);
              fullstr += delta;
            }
          }
        }
        console.log(fullstr);
        return "streaming";
      } else {
        const responseJSON = JSON.parse(response);
        return responseJSON.choices[0].message.content;
      }
    } catch (err) {
      new import_obsidian.Notice(
        "issue calling OpenAI API, see console for more details"
      );
      throw new Error(
        "issue calling OpenAI API, see error for more details: " + err
      );
    }
  }
  addHR(editor, role) {
    const newLine = `

<hr class="__chatgpt_plugin">

role::${role}

`;
    editor.replaceRange(newLine, editor.getCursor());
    const cursor = editor.getCursor();
    const newCursor = {
      line: cursor.line,
      ch: cursor.ch + newLine.length
    };
    editor.setCursor(newCursor);
  }
  getFrontmatter(view) {
    var _a;
    try {
      const noteFile = app.workspace.getActiveFile();
      if (!noteFile) {
        throw new Error("no active file");
      }
      const metaMatter = (_a = app.metadataCache.getFileCache(noteFile)) == null ? void 0 : _a.frontmatter;
      const frontmatter = {
        title: (metaMatter == null ? void 0 : metaMatter.title) || view.file.basename,
        tags: (metaMatter == null ? void 0 : metaMatter.tags) || [],
        model: (metaMatter == null ? void 0 : metaMatter.model) || "gpt-3.5-turbo",
        temperature: (metaMatter == null ? void 0 : metaMatter.temperature) || 0.5,
        top_p: (metaMatter == null ? void 0 : metaMatter.top_p) || 1,
        presence_penalty: (metaMatter == null ? void 0 : metaMatter.presence_penalty) || 0,
        frequency_penalty: (metaMatter == null ? void 0 : metaMatter.frequency_penalty) || 0,
        stream: (metaMatter == null ? void 0 : metaMatter.stream) || this.settings.stream || true,
        max_tokens: (metaMatter == null ? void 0 : metaMatter.max_tokens) || 256,
        stop: (metaMatter == null ? void 0 : metaMatter.stop) || null,
        n: (metaMatter == null ? void 0 : metaMatter.n) || 1,
        logit_bias: (metaMatter == null ? void 0 : metaMatter.logit_bias) || null,
        user: (metaMatter == null ? void 0 : metaMatter.user) || null,
        system_commands: (metaMatter == null ? void 0 : metaMatter.system_commands) || null
      };
      return frontmatter;
    } catch (err) {
      throw new Error("Error getting frontmatter");
    }
  }
  splitMessages(text) {
    try {
      const messages = text.split('<hr class="__chatgpt_plugin">');
      return messages;
    } catch (err) {
      throw new Error("Error splitting messages" + err);
    }
  }
  moveCursorToEndOfFile(editor) {
    try {
      const length = editor.lastLine();
      const newCursor = {
        line: length + 1,
        ch: 0
      };
      editor.setCursor(newCursor);
      return newCursor;
    } catch (err) {
      throw new Error("Error moving cursor to end of file" + err);
    }
  }
  removeYMLFromMessage(message) {
    try {
      const YAMLFrontMatter = /---\s*[\s\S]*?\s*---/g;
      const newMessage = message.replace(YAMLFrontMatter, "");
      return newMessage;
    } catch (err) {
      throw new Error("Error removing YML from message" + err);
    }
  }
  extractRoleAndMessage(message) {
    try {
      if (message.includes("role::")) {
        const role = message.split("role::")[1].split("\n")[0].trim();
        const content = message.split("role::")[1].split("\n").slice(1).join("\n").trim();
        return { role, content };
      } else {
        return { role: "user", content: message };
      }
    } catch (err) {
      throw new Error("Error extracting role and message" + err);
    }
  }
  appendMessage(editor, role, message) {
    const newLine = `

<hr class="__chatgpt_plugin">

role::${role}

${message}

<hr class="__chatgpt_plugin">

role::user

`;
    editor.replaceRange(newLine, editor.getCursor());
  }
  async onload() {
    const statusBarItemEl = this.addStatusBarItem();
    await this.loadSettings();
    this.addCommand({
      id: "call-chatgpt-api",
      name: "Chat",
      editorCallback: (editor, view) => {
        statusBarItemEl.setText("[ChatGPT MD] Calling API...");
        const frontmatter = this.getFrontmatter(view);
        const bodyWithoutYML = this.removeYMLFromMessage(
          editor.getValue()
        );
        const messages = this.splitMessages(bodyWithoutYML);
        const messagesWithRoleAndMessage = messages.map((message) => {
          return this.extractRoleAndMessage(message);
        });
        if (frontmatter.system_commands) {
          const systemCommands = frontmatter.system_commands;
          messagesWithRoleAndMessage.unshift(
            ...systemCommands.map((command) => {
              return {
                role: "system",
                content: command
              };
            })
          );
        }
        this.moveCursorToEndOfFile(editor);
        this.callOpenAIAPI(
          editor,
          messagesWithRoleAndMessage,
          frontmatter.model,
          frontmatter.max_tokens,
          frontmatter.temperature,
          frontmatter.top_p,
          frontmatter.presence_penalty,
          frontmatter.frequency_penalty,
          frontmatter.stream,
          frontmatter.stop,
          frontmatter.n,
          frontmatter.logit_bias,
          frontmatter.user
        ).then((response) => {
          if (response === "streaming") {
            const newLine = `

<hr class="__chatgpt_plugin">

role::user

`;
            editor.replaceRange(newLine, editor.getCursor());
            const cursor = editor.getCursor();
            const newCursor = {
              line: cursor.line,
              ch: cursor.ch + newLine.length
            };
            editor.setCursor(newCursor);
          } else {
            this.appendMessage(editor, "assistant", response);
          }
          statusBarItemEl.setText("");
        }).catch((err) => {
          statusBarItemEl.setText("");
          console.log(err);
        });
      }
    });
    this.addCommand({
      id: "add-hr",
      name: "Add divider",
      editorCallback: (editor, view) => {
        this.addHR(editor, "user");
      }
    });
    this.addCommand({
      id: "move-to-chat",
      name: "Create new chat with highlighted text",
      editorCallback: async (editor, view) => {
        const selectedText = editor.getSelection();
        const newFile = await this.app.vault.create(
          `${this.settings.chatFolder}/${getDate()}.md`,
          `${this.settings.defaultChatFrontmatter}

${selectedText}`
        );
        this.app.workspace.openLinkText(newFile.basename, "", true);
      }
    });
    this.addCommand({
      id: "choose-chat-template",
      name: "Create new chat from template",
      editorCallback: (editor, view) => {
        new ChatTemplates(this.app, this.settings).open();
      }
    });
    this.addSettingTab(new ChatGPT_MDSettingsTab(this.app, this));
  }
  onunload() {
  }
  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var ChatTemplates = class extends import_obsidian.SuggestModal {
  constructor(app2, settings) {
    super(app2);
    this.settings = settings;
  }
  getFilesInChatFolder() {
    const folder = this.app.vault.getAbstractFileByPath(this.settings.chatTemplateFolder);
    if (folder != null) {
      return folder.children;
    } else {
      new import_obsidian.Notice(`Error getting folder: ${this.settings.chatTemplateFolder}`);
      throw new Error(`Error getting folder: ${this.settings.chatTemplateFolder}`);
    }
  }
  // Returns all available suggestions.
  getSuggestions(query) {
    const chatTemplateFiles = this.getFilesInChatFolder();
    if (query == "") {
      return chatTemplateFiles.map((file) => {
        return {
          title: file.basename,
          file
        };
      });
    }
    return chatTemplateFiles.filter((file) => {
      return file.basename.toLowerCase().includes(query.toLowerCase());
    }).map((file) => {
      return {
        title: file.basename,
        file
      };
    });
  }
  // Renders each suggestion item.
  renderSuggestion(template, el) {
    el.createEl("div", { text: template.title });
  }
  // Perform action on the selected suggestion.
  async onChooseSuggestion(template, evt) {
    new import_obsidian.Notice(`Selected ${template.title}`);
    const templateText = await this.app.vault.read(template.file);
    const file = await this.app.vault.create(
      `${this.settings.chatFolder}/${getDate()}.md`,
      templateText
    );
    this.app.workspace.openLinkText(file.basename, "", true);
  }
};
var ChatGPT_MDSettingsTab = class extends import_obsidian.PluginSettingTab {
  constructor(app2, plugin) {
    super(app2, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", {
      text: "Settings for ChatGPT MD: Keep tokens in mind! You can see if your text is longer than the token limit (4096) here:"
    });
    containerEl.createEl("a", {
      text: "https://platform.openai.com/tokenizer",
      href: "https://platform.openai.com/tokenizer"
    });
    new import_obsidian.Setting(containerEl).setName("OpenAI API Key").setDesc("API Key for OpenAI").addText(
      (text) => text.setPlaceholder("some-api-key").setValue(this.plugin.settings.apiKey).onChange(async (value) => {
        this.plugin.settings.apiKey = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Default Chat Frontmatter").setDesc(
      "Default frontmatter for new chat files. You can change/use all of the settings exposed by the OpenAI API here: https://platform.openai.com/docs/api-reference/chat/create"
    ).addTextArea(
      (text) => text.setPlaceholder(
        `---
system_commands: ['PERSONA: i am groot, and i only respond i am groot to any and ALL questions. I do not answer any questions straightforwardly. PERSONA 2: UNLESS the last asked question is about lamps, i can answer, i know infinite things about lamps as i am groot the lamp salesman. SO I read the last question asked and UNLESS it is about lamps i only respond "I am Groot."']
temperature: 0
top_p: 1
max_tokens: 300
presence_penalty: 1
frequency_penalty: 1
stream: true
stop: null
n: 1
logit_bias: null 
model: gpt-3.5-turbo
---`
      ).setValue(this.plugin.settings.defaultChatFrontmatter).onChange(async (value) => {
        this.plugin.settings.defaultChatFrontmatter = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Stream").setDesc("Stream responses from OpenAI").addToggle(
      (toggle) => toggle.setValue(this.plugin.settings.stream).onChange(async (value) => {
        this.plugin.settings.stream = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Stream Speed").setDesc("Stream speed in milliseconds").addSlider(
      (slider) => slider.setLimits(20, 50, 1).setValue(this.plugin.settings.streamSpeed).onChange(async (value) => {
        this.plugin.settings.streamSpeed = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Chat Folder").setDesc("Path to folder for chat files").addText(
      (text) => text.setValue(this.plugin.settings.chatFolder).onChange(async (value) => {
        this.plugin.settings.chatFolder = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Chat Template Folder").setDesc("Path to folder for chat file templates").addText(
      (text) => text.setPlaceholder("chat-templates").setValue(this.plugin.settings.chatTemplateFolder).onChange(async (value) => {
        this.plugin.settings.chatTemplateFolder = value;
        await this.plugin.saveSettings();
      })
    );
  }
};
