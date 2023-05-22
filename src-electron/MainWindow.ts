import { BrowserWindow, ipcMain, screen, shell, Tray, Menu, app } from 'electron'
import * as path from 'path'
import { getStore } from 'app/src-electron/Store'
import { ConfigStore } from 'app/src-electron/config/ConfigStore'

const appStore = getStore('app');
const config = ConfigStore().get();
const iconFolder = path.resolve(process.env.DEV ? 'src-electron' : __dirname, 'icons')

function getNewWindowBounds() {
  const bounds = appStore.get('winBounds');
  if(!bounds) return;

  const options = {x: undefined, y: undefined, width: undefined, height: undefined, maximize: false};
  if(bounds.maximize) {
    options.maximize = true;
    return options;
  }

  const area = screen.getDisplayMatching(bounds).workArea;

  // If the saved position still valid (the window is entirely inside the display area), use it.
  if (
    bounds.x >= area.x &&
    bounds.y >= area.y &&
    bounds.x + bounds.width <= area.x + area.width &&
    bounds.y + bounds.height <= area.y + area.height
  ) {
    options.x = bounds.x;
    options.y = bounds.y;
  }

  // If the saved size is still valid, use it.
  if (bounds.width <= area.width || bounds.height <= area.height) {
    options.width = bounds.width;
    options.height = bounds.height;
  }

  return options;
}

const createSystray = (window: BrowserWindow): Tray => {
  const tray = new Tray(path.resolve(iconFolder, 'icon.ico'))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir',
      click: () => window.show()
    }, {
      label: 'Cerrar',
      click:  () => window.close()
    }
  ])

  tray.setToolTip('VTerm')
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => window.show())

  return tray
}

export async function createWindow() {
  /**
   * Splash screen setup
   */
  // let splashWindow: BrowserWindow | undefined;
  // if(BrowserWindow.getAllWindows().length === 0) {
  //   splashWindow = new BrowserWindow({
  //     width: 300,
  //     height: 300,
  //     transparent: true,
  //     frame: false,
  //     alwaysOnTop: true,
  //     skipTaskbar: true,
  //   });
  //
  //   splashWindow.loadURL(buildUrl('splash.html'));
  // }

  /**
   * Main screen setup
   */
  const bounds = getNewWindowBounds();
  const mainWindow = new BrowserWindow({
    icon: path.resolve(iconFolder, 'icon.png'), // tray icon
    show: false, // Use 'ready-to-show' event to show window
    frame: false,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
    ...bounds,
  });

  if(bounds?.maximize && mainWindow.maximizable) {
    mainWindow.maximize();
  }

  mainWindow.removeMenu();

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  mainWindow.on('ready-to-show', () => {
    // splashWindow?.destroy();
    mainWindow?.show();

    if (process.env.DEV) {
      mainWindow?.webContents.openDevTools();
      ipcMain.on('devtool', () => {
        mainWindow?.webContents.toggleDevTools();
      });
    }
  });

  // Recuerda posicion, para luego abrirse en el mismo lugar
  mainWindow.on('close', () => {
    appStore.set('winBounds', {
      ...mainWindow.getBounds(),
      maximize: mainWindow.isMaximized(),
    });
  });

  mainWindow.webContents.setWindowOpenHandler(({url}) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Avisa al renderer de que la ventana se ha un/maximizado
  for (const ev of ['maximize', 'unmaximize', 'minimize', 'restore'] as any) {
    mainWindow.on(ev, () => {
      mainWindow.webContents.send('window:is-maximize', mainWindow.isMaximized())
    })
  }

  /**
   * URL for main window.
   */
  mainWindow.loadURL(process.env.APP_URL)

  /**
   * System Tray
   */
  let tray: Tray | undefined
  mainWindow.on('hide', () => tray = createSystray(mainWindow))
  mainWindow.on('show', () => tray?.destroy())

  return mainWindow;
}

/**
 * Restore existing BrowserWindow or Create new BrowserWindow
 */
export async function restoreOrCreateWindow() {
  const multiwindow: boolean = config.multiwindow;
  if(multiwindow) {
    return await createWindow();
  }

  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  } else if(!window.isVisible()) {
    window.show();
  }

  window.focus();
}
