const { ipcRenderer } = require('electron');
const store = require('electron-store');
const log = require('electron-log');
const path = require('path');
const vvcTool = require('../util/tool');
log.info(vvcTool)

const tools = new vvcTool.clientTools()
log.info(tools)

const config = new store()
const tool = new vvcTool.settingTool();

window.tool = new vvcTool.settingTool();

log.info(window.tool)


document.addEventListener('DOMContentLoaded', () => {
    tool.closeSetting()
    tools.setupClientSetting();
    document.body.insertAdjacentHTML("beforeend", tools.vvcSettingStyleInject());
})