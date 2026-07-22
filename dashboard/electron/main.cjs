const { app, BrowserWindow, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

// Only the explicit local development command may use the Vite server or
// expose DevTools. Treating an incomplete/unpacked install as development
// leaves users with a blank window when no Vite server is running.
const isDev = process.env.NODE_ENV === 'development';
let daemonProcess = null;

function appIconPath() {
  return isDev
    ? path.join(__dirname, '../build/icon.ico')
    : path.join(process.resourcesPath, 'icon.ico');
}

function daemonEntryPath() {
  return isDev
    ? path.join(__dirname, '../../daemon/src/index.ts')
    : path.join(process.resourcesPath, 'daemon/src/index.ts');
}

function daemonEnvironment() {
  const inheritedPath = process.env.PATH || process.env.Path || '';
  const userNpmBin = process.platform === 'win32' && process.env.APPDATA
    ? path.join(process.env.APPDATA, 'npm')
    : null;
  const runtimePath = userNpmBin
    ? [userNpmBin, inheritedPath].filter(Boolean).join(path.delimiter)
    : inheritedPath;

  return {
    ...process.env,
    PATH: runtimePath,
    Path: runtimePath,
    ELECTRON_RUN_AS_NODE: '1',
    TG_DAEMON_HOST: '127.0.0.1',
    TG_DAEMON_PORT: '47291',
  };
}

function startDaemon() {
  if (daemonProcess && !daemonProcess.killed) {
    return;
  }

  // The daemon is shipped as TypeScript and is run with Electron's bundled
  // Node runtime. Its working directory is user-writable so the SQLite
  // database and settings never end up in the installed application folder.
  const spawnedDaemon = spawn(
    process.execPath,
    ['--experimental-strip-types', daemonEntryPath()],
    {
      cwd: app.getPath('userData'),
      windowsHide: true,
      env: daemonEnvironment(),
      stdio: isDev ? 'inherit' : 'ignore',
    },
  );
  daemonProcess = spawnedDaemon;

  spawnedDaemon.on('error', (error) => {
    console.error('Unable to start the TokenGuard daemon:', error);
  });

  spawnedDaemon.on('exit', (code, signal) => {
    if (daemonProcess === spawnedDaemon) {
      daemonProcess = null;
    }
    console.log(`TokenGuard daemon exited (code: ${code}, signal: ${signal}).`);
  });
}

function stopDaemon() {
  if (!daemonProcess || daemonProcess.killed) {
    return;
  }

  daemonProcess.kill();
  daemonProcess = null;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'TokenGuard Dashboard',
    icon: appIconPath(),
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
  startDaemon();
  createWindow();

  app.on('activate', () => {
    // Re-create window on macOS when dock icon is clicked and no windows are open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', stopDaemon);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
