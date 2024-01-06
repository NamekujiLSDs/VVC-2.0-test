const { ipcRenderer, shell } = require('electron');
const store = require("electron-store");
const log = require("electron-log");
const path = require("path")

const config = new store()
const setting = require("./setting")

log.info("gametools.js has been loaded.")

exports.clientTools = class {
    generateSettingDom(val) {
        log.info(val)
        switch (val.type) {
            case "checkbox":
                return `<input id="settingCheckbox" type="checkbox" onclick="window.tool.setSetting('${val.id},this.checked')" "${config.get(val.id, val.default) ? ' checked' : ''}">`;
            case "text":
                return `<input id="settingTextbox" type="text" onInput="window.tool.setSetting('${val.id},this.value')" value="${config.get(val.id) != null ? config.get(val.id) : val.default}" > `;
            case "select":
                let dom = `<select onchange="window.tool.setSetting('${val.id},this.value');">`
                Object.keys(val.options).forEach((opt) => {
                    dom += `<option value="${opt}" ${config.get(val.id, val.default) === opt ? ' selected' : ''}> ${val.options[opt]} </option>`
                });
                return dom += `</select>`;
            case "range-text":
                return `
                <div id="rangeNum">
                    <input type="range" id="range${val.id}"min="0" max="1024" value="${config.get(val.id) ? config.get(val.id) : val.default}" step="1" oninput="window.tool.sliderMove(${val.id},this.value);window.tool.setSetting("${val.id},this.value")">
                    <input type="number" id="num${val.id}" min="0" max="1024" value="${config.get(val.id) ? config.get(val.id) : val.default}" step="1"oninput="window.tool.numInput(${val.id},this.value);window.tool.setSetting("${val.id},this.value")">
                </div>`;
            case "textarea":
                return `
                <textarea id="${val.id}" onchange="window.tool.setSetting('${val.id},this.value')">${config.get(val.id) != null ? val.id : ""}</textarea>`;
            case "password":
                return `<input type="password" id="${val.id}" oninput="window.tool.setSetting('${val.id},this.value'))" value="${config.get(val.id) != null ? vai.id : ""}">`;
            case "button":
                return `<input type="button" id="${val.id}" value="${val.buttonVal}" onclick="window.tool.setSetting('${val.id}')">`;
            case "openFile":
                return `<input title="${config.get(val.id) ? val.id : 'No file selected'}" type="button" id="${val.id}" value="OPEN FILE" onclick="window.tool.openFile(${val.id})">`;
        }
    };
    setupClientSetting() {
        const windowInitialize = () => {
            let settingWindowHTML = `<div id="vvcSetting"><div id="settingTitleBar">Vanced Voxiom Client Settings<span class="material-symbols-outlined closeBtn" onclick="window.tool.closeSetting()">close</span></div><div id="setBody">`;
            let prevCat = null;
            log.info("setting", setting)
            Object.values(setting).forEach((val) => {
                let dom = "";
                if (val.cat != prevCat) {
                    console.log("prev cat is ", prevCat)
                    if (prevCat) {
                        console.log(prevCat)
                        dom += `</div>`
                    }
                    dom += `<div id="setBox">
                                <div id="${val.cat}" class="catTitle">${val.cat}</div><div id="horizonalSpacer"></div>`;
                    prevCat = val.cat
                }
                dom += `<div id="setItem"><div id="settingName">${val.title}</div>`
                settingWindowHTML += dom + this.generateSettingDom(val) + "</div>"
            });
            settingWindowHTML += `<div id=setBox><div class=catTitle>Account manager</div><div id=horizonalSpacer></div><div id=setItem class=gridBtn><input onclick='window.open("https://google.com")'type=button value=Google> <input onclick='window.open("https://www.facebook.com")'type=button value=Facebook> <input onclick='window.open("https://discord.com/channels/@me")'type=button value=Discord> <input onclick='window.location.href="https://voxiom.io/auth/logout"'type=button value=" Logout Voxiom "></div></div><div id=setBox><div class=catTitle>Other setting</div><div id=horizonalSpacer></div><div id=setItem class=gridBtn><input onclick=window.tool.clearCache() type=button value="Cache clear"> <input onclick=window.tool.resetAll() type=button value="Reset all"> <input onclick=window.tool.restart() type=button value="Restart client"> <input onclick=window.tool.help() type=button value=Help></div></div>`

            return settingWindowHTML ? settingWindowHTML + "</div></div></div>" : ""
        }
        document.body.insertAdjacentHTML("afterbegin", windowInitialize())
    }
    vvcSettingStyleInject() {
        let dom = `<link rel="stylesheet" href="vvc://${path.join(__dirname, "../../html/css/vvc.css")}">`
        return dom
    }
};

exports.settingTool = class {
    closeSetting() {
        let settingWindow = document.getElementById("vvcSetting");
        settingWindow != null ? settingWindow.classList.toggle("hide") : ""
    }
}