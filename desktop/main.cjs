const { app, BrowserWindow, Menu, shell, session, dialog } = require("electron");
const path = require("node:path");

const APP_URL = "https://afterscene.el-ulicesss.workers.dev/";
const APP_ORIGIN = new URL(APP_URL).origin;
const AUTH_ORIGINS = new Set([
  "https://uvuhaksfevjpqwhjnkmh.supabase.co",
  "https://accounts.google.com",
]);

app.setAppUserModelId("com.afterscene.desktop");
app.commandLine.appendSwitch("force-color-profile", "srgb");

function trustedNavigation(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.origin === APP_ORIGIN || AUTH_ORIGINS.has(url.origin));
  } catch {
    return false;
  }
}

function openInBrowser(value) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "mailto:") {
      void shell.openExternal(url.toString());
    }
  } catch { /* Ignore malformed navigation. */ }
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1450,
    height: 900,
    minWidth: 900,
    minHeight: 620,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#06090c",
    title: "AFTERSCENE",
    icon: path.join(__dirname, "assets", "afterscene.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      webviewTag: false,
      allowRunningInsecureContent: false,
    },
  });

  window.once("ready-to-show", () => window.show());
  window.webContents.on("will-navigate", (event, url) => {
    if (!trustedNavigation(url)) {
      event.preventDefault();
      openInBrowser(url);
    }
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    openInBrowser(url);
    return { action: "deny" };
  });
  window.webContents.on("did-fail-load", (_event, errorCode, _description, url, isMainFrame) => {
    if (!isMainFrame || errorCode === -3) return;
    try {
      if (url.startsWith(APP_ORIGIN) || AUTH_ORIGINS.has(new URL(url).origin)) {
        void window.loadFile(path.join(__dirname, "offline.html"));
      }
    } catch { /* A malformed URL cannot be retried. */ }
  });

  const menu = Menu.buildFromTemplate([
    { label: "AFTERSCENE", submenu: [
      { label: "Ir al inicio", click: () => void window.loadURL(APP_URL) },
      { label: "Recargar", accelerator: "CmdOrCtrl+R", click: () => void window.loadURL(APP_URL) },
      { label: "Abrir en navegador", click: () => openInBrowser(APP_URL) },
      { type: "separator" },
      { role: "quit", label: "Salir" },
    ] },
    { label: "Ver", submenu: [
      { role: "zoomIn", label: "Acercar" },
      { role: "zoomOut", label: "Alejar" },
      { role: "resetZoom", label: "Tamaño original" },
      { role: "togglefullscreen", label: "Pantalla completa" },
    ] },
    { label: "Ayuda", submenu: [
      { label: "Página de descarga", click: () => openInBrowser(`${APP_ORIGIN}/descargar`) },
      { label: "Acerca de AFTERSCENE", click: () => void dialog.showMessageBox(window, {
        type: "info", title: "AFTERSCENE", message: "AFTERSCENE",
        detail: `Versión ${app.getVersion()}\nTu mundo audiovisual, siempre contigo.`,
      }) },
    ] },
  ]);
  Menu.setApplicationMenu(menu);
  void window.loadURL(APP_URL);
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
