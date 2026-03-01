const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

console.log('Electron starting...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('isDev:', isDev);

let mainWindow;
let bubbleWindow;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        icon: path.join(__dirname, '../public/logo.png'),
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
        console.log('Main window closed');
        // if (bubbleWindow) bubbleWindow.close();
    });
}

function createBubbleWindow() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

    // Default to a safe corner if screen dimensions are wonky
    const winX = screenWidth ? screenWidth - 270 : 100;
    const winY = screenHeight ? screenHeight - 270 : 100;

    bubbleWindow = new BrowserWindow({
        width: 250,
        height: 250,
        x: winX,
        y: winY,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: false,
        hasShadow: false,
        show: true, // Show immediately for debugging
        skipTaskbar: false, // Keep in taskbar for now so user can see it's running
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Bring to front
    bubbleWindow.setAlwaysOnTop(true, 'screen-saver');
    bubbleWindow.setVisibleOnAllWorkspaces(true);

    const bubbleUrl = isDev
        ? 'http://localhost:3000/floating-bubble'
        : `file://${path.join(__dirname, '../out/floating-bubble.html')}`;

    bubbleWindow.loadURL(bubbleUrl);
    console.log('Bubble window loading:', bubbleUrl);

    bubbleWindow.once('ready-to-show', () => {
        console.log('Bubble window ready to show');
        bubbleWindow.show();
    });

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

app.on('window-all-closed', (e) => {
    // Prevent app from quitting for testing purposes
    // app.quit(); 
    console.log('All windows closed event triggered');
});

app.on('activate', () => {
    if (mainWindow === null) {
        createMainWindow();
    }
});
