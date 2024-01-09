const { ipcRenderer, shell } = require('electron');
const store = require("electron-store");
const log = require("electron-log");
const path = require("path")

const config = new store()
const setting = require("./setting")

log.info("gametools.js has been loaded.")

exports.clientTools = class {
    generateSettingDom(val) {
        log.info(val.id, config.get(val.id))
        switch (val.type) {
            case "checkbox":
                return `<input id="settingCheckbox" type="checkbox" onclick="window.tool.setSetting('${val.id}',this.checked)"${config.get(val.id, val.default) ? 'checked' : ''}>`;
            case "text":
                return `<input id="settingTextbox" type="text" onInput="window.tool.setSetting('${val.id}',this.value)" value="${config.get(val.id) != null ? config.get(val.id) : val.default}" > `;
            case "select":
                let dom = `<select onchange="window.tool.setSetting('${val.id}',this.value);">`
                Object.keys(val.options).forEach((opt) => {
                    dom += `<option value="${opt}" ${config.get(val.id, val.default) === opt ? ' selected' : ''}> ${val.options[opt]} </option>`
                });
                return dom += `</select>`;
            case "range-text":
                return `
                <div id="rangeNum">
                    <input type="range" id="range${val.id}"min="0" max="1024" value="${config.get(val.id) ? config.get(val.id) : val.default}" step="1" oninput="window.tool.sliderMove('${val.id}',this.value);window.tool.setSetting('${val.id}',this.value)">
                    <input type="number" id="num${val.id}" min="0" max="1024" value="${config.get(val.id) ? config.get(val.id) : val.default}" step="1"oninput="window.tool.numInput('${val.id}',this.value);window.tool.setSetting('${val.id}',this.value)">
                </div>`;
            case "textarea":
                return `
                <textarea id="${val.id}" onchange="window.tool.setSetting('${val.id}',this.value)">${config.get(val.id) != null ? val.id : ""}</textarea>`;
            case "password":
                return `<input type="password" id="${val.id}" oninput="window.tool.setSetting('${val.id}',this.value))" value="${config.get(val.id) != null ? vai.id : ""}">`;
            case "button":
                return `<input type="button" id="${val.id}" value="${val.buttonVal}" onclick="window.tool.setSetting('${val.id}')">`;
            case "openFile":
                return `<input title="${config.get(val.id) ? val.id : 'No file selected'}" type="button" id="${val.id}" value="OPEN FILE" onclick="window.tool.openFile('${val.id}')">`;
        }
    };
    setupClientSetting() {
        const windowInitialize = () => {
            let settingWindowHTML = `<div id="windowCloser" onclick="window.tool.closeSetting()" class="${config.get("settingWindowOpen") ? "" : "hide"}"></div><div id="vvcSetting" ${config.get("settingWindowOpen") ? 'class=""' : 'class="hide" '}><div id="settingTitleBar">Vanced Voxiom Client Settings<span class="material-symbols-outlined closeBtn" onclick="window.tool.closeSetting()">close</span></div><div id="setBody">`;
            let prevCat = null;
            Object.values(setting).forEach((val) => {
                let dom = "";
                if (val.cat != prevCat) {
                    if (prevCat) {
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
    };
    vvcSettingStyleInject() {
        let dom = `<link rel="stylesheet" href="vvc://${path.join(__dirname, "../../html/css/vvc.css")}">`
        return dom
    };
    initDoms() {
        let dom1 = `<style id="customBgCss">.bNczYf{background-image:url("${config.get("customBG") == null || config.get("customBG") == "" ? setting.customBackGround.default : config.get("customBG")}")}.hrxbol{content:url("${config.get("customLogo") == "" || config.get("customLogo") == null ? setting.customGameLogo.default : config.get("customLogo")}")}</style>`;
        document.body.insertAdjacentHTML("afterbegin", dom1);
        let dom2 = `<style> .snowflakes {display: ${config.get("disableSnow") !== true ? "unset" : "none"}}</style>`
        document.body.insertAdjacentHTML("afterbegin", dom2);
        let crosshair = `<img id="crosshair" style="width:${config.get("crosshairSizeX") != null ? config.get("crosshairSizeX") : setting.crosshairSizeX.default}px;height:${config.get("crosshairSizeY") != null ? config.get("crosshairSizeY") : setting.crosshairSizeY.default}px;" src="${config.get("customCrosshairImage") != null ? config.get("customCrosshairImage") : setting.customCrosshairImage.default}" class="${config.get("customCrosshairCheckbox") ? "" : "hide"}" ></img>`
        document.getElementById("app").insertAdjacentHTML("afterbegin", crosshair);

    };
    initTitleText() {
        let titleText = document.getElementsByClassName("yYlig")[0]
        titleText.innerText = config.get("customGameLogoText")
    };
    urlChanged(url) {
        switch (url) {
            case "https://voxiom.io/account":

                function accountInject() {
                    let dom = document.querySelector('.lfDZCd');
                    if (dom) {
                        dom.innerHTML = `<div id=login><a class=discord href=http://voxiom.io/auth/google2 id=loginBtn target=_self>Sign in with Discord</a> <a class=google href=http://voxiom.io/auth/google2 id=loginBtn target=_self>Sign in with Google</a> <a class=facebook href=http://voxiom.io/auth/google2 id=loginBtn target=_self>Sign in with Facebook</a></div><style>#loginBtn{text-align:center;padding:10px;text-decoration:none;color:#fff;margin-bottom:10px;width:200px;display:flex;-webkit-box-align:center;align-items:center;cursor:pointer}.discord{background-color:#7289da}.google{background-color:#ea4435}.facebook{background-color:#4967aa}.discord:hover{background-color:#8da6ff}.google:hover{background-color:#ff6a5c}.facebook:hover{background-color:#658be2}</style>`
                    }
                }
                accountInject();
                break;
        }
    }
}
exports.settingTool = class {
    closeSetting() {
        let settingWindow = document.getElementById("vvcSetting");
        let closer = document.getElementById("windowCloser");
        settingWindow != null ? settingWindow.classList.toggle("hide") : "";
        closer != null ? closer.classList.toggle("hide") : "";
        config.set("settingWindowOpen", !document.getElementById("vvcSetting").classList.contains("hide"))
    };
    setSetting(id, value) {
        config.set(id, value);
        log.info(id, value)
        switch (id) {
            case "customBG":
                document.getElementById("customBgCss").innerText = `.bNczYf{background-image:url("${value == "" ? setting.customBackGround.default : value = null ? setting.customBackGround.default : value}")}.hrxbol{content:url("${config.get("customLogo") == "" || config.get("customLogo") == null ? setting.customGameLogo.default : config.get("customLogo")} ")}`
                break;
            case "customLogo":
                document.getElementById("customBgCss").innerText = `.bNczYf{background-image:url("${config.get("customBG") == null || config.get("customBG") == "" ? setting.customBackGround.default : config.get("customBG")}")}.hrxbol{content:url("${value == "" || value == null ? setting.customGameLogo.default : value}")}`;;
                break;
            case "customGameLogoText":
                document.querySelector(".yYlig").innerText = value
                break;
            case "customCrosshairCheckbox":
                value ? document.getElementById('crosshair').classList.remove("hide") : document.getElementById('crosshair').classList.add("hide");
                break;
            case "customCrosshairImage":
                document.getElementById("crosshair").setAttribute("src", value)
                break;
            case "crosshairSizeX":
                document.getElementById("crosshair").setAttribute("style", `width:${value != null ? value : setting.crosshairSizeX.default}px;height:${config.get("crosshairSizeY") != null ? config.get("crosshairSizeY") : setting.crosshairSizeY.default}px;`)
                break;
            case "crosshairSizeY":
                document.getElementById("crosshair").setAttribute("style", `width:${config.get("crosshairSizeX") != null ? config.get("crosshairSizeX") : setting.crosshairSizeX.default}px;height:${value != null ? value : setting.crosshairSizeY.default}px;`)
                break;
            case "detectCrosshairSize":
                document.getElementById("crosshair").
                    break;
            case "cssType":
                break;
            case "cssTextarea":
                break;
            case "cssLocal":
                break;
            case "cssUrl":
                break;
            case "quickJoinRegion":
                break;
            case "quickJoinMode":
                break;
            case "disableSnow":
                break;
            case "disableGemPopup":
                break;
            case "enableCtW":
                break;
            case "webhookUrl":
                break;
            case "resourceSwapperEnable":
                break;
        }

    }
    sliderMove(id, value) {
        switch (id) {
            case "crosshairSizeX":
                document.getElementById("numcrosshairSizeX").value = value;
                if (value == null || value == "") {
                    document.getElementById("numcrosshairSizeX").value = 0;
                    document.getElementById("rangecrosshairSizeX").value = 0;
                }
                break;
            case "crosshairSizeY":
                document.getElementById("numcrosshairSizeY").value = value;
                if (value == null || value == "") {
                    document.getElementById("numcrosshairSizeY").value = 0;
                    document.getElementById("rangecrosshairSizeY").value = 0;
                }
                break;
        }
    }
    numInput(id, value) {
        switch (id) {
            case "crosshairSizeX":
                document.getElementById("rangecrosshairSizeX").value = value;
                if (value == null || value == "") {
                    document.getElementById("numcrosshairSizeX").value = 0;
                    document.getElementById("rangecrosshairSizeX").value = 0;
                }
                break;
            case "crosshairSizeY":
                document.getElementById("rangecrosshairSizeY").value = value;
                if (value == null || value == "") {
                    document.getElementById("numcrosshairSizeY").value = 0;
                    document.getElementById("rangecrosshairSizeY").value = 0;
                }
                break;
        }
    }
};