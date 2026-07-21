const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'TokenGuard Dashboard',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Remove default menu bar
  win.setMenuBarVisibility(false);

  if (isDev) {
    // Load from Vite dev server
    win.loadURL('http://localhost:5199');
    win.webContents.openDevTools();
  } else {
    // Load the built Vite output
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Firebase's popup must remain in Electron so it can return the signed-in
  // user to the dashboard renderer. Ordinary links still open externally.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\/[^/]+\/__\/auth\//.test(url)) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 520,
          height: 720,
          autoHideMenuBar: true,
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
          },
        },
      };
    }

    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // Re-create window on macOS when dock icon is clicked and no windows are open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
