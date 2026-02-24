const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let bubbleWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../out/index.html')}`;

    mainWindow.loadURL(startUrl);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (bubbleWindow) bubbleWindow.close();
    });
}

function createBubbleWindow() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

    bubbleWindow = new BrowserWindow({
        width: 250, // Slightly larger for expansion
        height: 250,
        x: screenWidth - 270,
        y: screenHeight - 270,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        hasShadow: false,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    const bubbleUrl = isDev
        ? 'http://localhost:3000/floating-bubble'
        : `file://${path.join(__dirname, '../out/floating-bubble.html')}`;

    bubbleWindow.loadURL(bubbleUrl);

    // Set ignore mouse events when only the bubble (circle) is visible if needed
    // bubbleWindow.setIgnoreMouseEvents(true, { forward: true });

    bubbleWindow.on('closed', () => {
        bubbleWindow = null;
    });
}

app.on('ready', () => {
    createMainWindow();
    createBubbleWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});
