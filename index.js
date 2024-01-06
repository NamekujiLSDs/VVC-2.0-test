const {
    app,
    Menu,
    BrowserWindow,
    protocol,
    ipcMain
} = require("electron");

const { autoUpdater } = require("electron-updater");
const localShortcut = require("electron-localshortcut");
const path = require("path");
const store = require('electron-store');
const DiscordRPC = require("discord-rpc");
const log = require('electron-log');

const config = new store();
const clientID = "1186209799935889469";
const RPC = new DiscordRPC.Client({ transport: "ipc" });


//バージョンの取得
ipcMain.handle("appVer", () => {
    const version = app.getVersion();
    return version;
});

ipcMain.handle("cacheClear", () => {
    Electron.session.defaultSession.clearCache()
})

let splashWindow
let mainWindow


// ビルドしてなくてもしてるように見せかける
Object.defineProperty(app, "isPackaged", {
    get() {
        return true;
    },
});


//カスタムプロトコルの登録
app.on("ready", () => {
    protocol.registerFileProtocol("vvc", (request, callback) =>
        callback(decodeURI(request.url.replace(/^vvc:\//, "")))
    );
});

protocol.registerSchemesAsPrivileged([{
    scheme: "vvc",
    privileges: {
        secure: true,
        corsEnabled: true,
    },
},]);

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 600,
        height: 300,
        frame: false,
        resizable: false,
        show: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, "js/preload/splash.js")
        },
    });
    splashWindow.loadFile(path.join(__dirname, "html/splash.html"));
    Menu.setApplicationMenu(null)
    const update = async () => {
        let updateCheck = null;
        autoUpdater.on("checking-for-update", () => {
            splashWindow.webContents.send("status", "Checking for updates...");
            updateCheck = setTimeout(() => {
                splashWindow.webContents.send("status", "Update check error!");
                setTimeout(() => {
                    createMainWindow();
                }, 1000);
            }, 15000);
        });
        autoUpdater.on("update-available", (i) => {
            if (updateCheck) clearTimeout(updateCheck);
            splashWindow.webContents.send("status", `Found new verison v${i.version}!`);
        });
        autoUpdater.on("update-not-available", () => {
            if (updateCheck) clearTimeout(updateCheck);
            splashWindow.webContents.send("status", "You are using the latest version!");
            setTimeout(() => {
                createMainWindow();
            }, 1000);
        });

        autoUpdater.on("error", (e) => {
            if (updateCheck) clearTimeout(updateCheck);
            splashWindow.webContents.send("status", "Error!" + e.name);
            setTimeout(() => {
                createMainWindow();
            }, 1000);
        });
        autoUpdater.on("download-progress", (i) => {
            if (updateCheck) clearTimeout(updateCheck);
            splashWindow.webContents.send("status", "Downloading new version...");
        });
        autoUpdater.on("update-downloaded", (i) => {
            if (updateCheck) clearTimeout(updateCheck);
            splashWindow.webContents.send("status", "Update downloaded");
            setTimeout(() => {
                autoUpdater.quitAndInstall();
            }, 1000);
        });
        autoUpdater.autoDownload = "download";
        autoUpdater.allowPrerelease = false;
        autoUpdater.checkForUpdates();
    };
    splashWindow.webContents.on("did-finish-load", () => {
        splashWindow.show();
        update();
    });
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        frame: false,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "js/preload/game.js"),
            enableHardwareAcceleration: true,
            enableRemoteModule: true,
            contextIsolation: true
        },
    });
    Menu.setApplicationMenu(null);

    //ショートカットの登録
    localShortcut.register(mainWindow, "Esc", () => {
        mainWindow.webContents.send("ESC")
    })
    localShortcut.register(mainWindow, "F1", () => {
        mainWindow.loadURL("https://voxiom.io")
    })
    localShortcut.register(mainWindow, "F5", () => {
        mainWindow.reload()
    })
    localShortcut.register(mainWindow, "F6", () => {
        mainWindow.send("F6")
    })
    localShortcut.register(mainWindow, "F8", () => {
        mainWindow.send("F8")
    })
    localShortcut.register(mainWindow, "F11", () => {
        const isFullScreen = mainWindow.isFullScreen();
        config.set('Fullscreen', !isFullScreen);
        mainWindow.setFullScreen(!isFullScreen);
    })
    localShortcut.register(mainWindow, "F12", () => {
        mainWindow.webContents.openDevTools()
    })

    //ページを閉じられるようにする。
    mainWindow.webContents.on('will-prevent-unload', (event) => {
        event.preventDefault()
    })

    mainWindow.webContents.loadURL("https://voxiom.io");
    //準備ができたら表示
    mainWindow.once("ready-to-show", () => {
        splashWindow.destroy();
        mainWindow.show()
    })
}

//flags
app.commandLine.appendSwitch("disable-frame-rate-limit");
app.commandLine.appendSwitch("disable-gpu-vsync");
app.commandLine.appendSwitch("in-process-gpu");
app.commandLine.appendSwitch("ignore-gpu-blocklist");
app.commandLine.appendSwitch("enable-quic");
app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-pointer-lock-options");

app.whenReady().then(() => {
    createSplashWindow()
})