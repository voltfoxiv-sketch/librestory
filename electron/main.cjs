const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: 'rgba(0,0,0,0)',
      symbolColor: '#cbd5e1',
    },
    backgroundColor: '#020617', // Match our dark theme background
    show: false, // Don't show until ready-to-show
  });

  // We show the window when it's ready to avoid a flash of white/blank screen
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load the index.html of the app.
  if (!app.isPackaged) {
    // In dev mode, wait for vite server and load it
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built static files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

ipcMain.on('window-minimize', (e) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  win?.minimize();
});

ipcMain.on('window-maximize', (e) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  if (win?.isMaximized()) {
    win.unmaximize();
  } else {
    win?.maximize();
  }
});

ipcMain.on('window-close', (e) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  win?.close();
});

ipcMain.on('set-theme', (e, theme) => {
  const win = BrowserWindow.fromWebContents(e.sender);
  if (!win) return;
  if (theme === 'polaris' || theme === 'classic') {
    win.setTitleBarOverlay({
      color: 'rgba(0,0,0,0)',
      symbolColor: 'rgba(0,0,0,0)'
    });
  } else if (theme === 'mono') {
    win.setTitleBarOverlay({
      color: 'rgba(0,0,0,0)',
      symbolColor: '#00ff00'
    });
  } else {
    win.setTitleBarOverlay({
      color: 'rgba(0,0,0,0)',
      symbolColor: '#cbd5e1'
    });
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
