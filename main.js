const electron = require('electron');
const ipc = require('electron').ipcMain;
const url  =require('url');
const path = require('path');
const { app , BrowserWindow , ipcMain , Menu}  = electron;

const isMac = process.platform === 'darwin';
// Set production for removing developer option during build
// process.env.NODE_ENV = 'production';

let mainWindow , addWindow;

// Listen for the app to be ready

app.on('ready', function(){
	// creating a the Main window
	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		}
	});
		// Load HTML Here
	mainWindow.loadURL(url.format({
		pathname : path.join(__dirname,'mainwindow.html'),
		protocol : 'file:',
		slashes : true
	}));
	// Quit Application Whem Closed
	mainWindow.on('closed', function() {
		app.quit();
	});

	// Building Menus from Template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	// Inserting Menu into Default Menu Template
	Menu.setApplicationMenu(mainMenu);
});

// Handle Create add Window
function createAddWindow() {
	// creating a new window
	addWindow = new BrowserWindow({
		frame: false,
		/*transparent: true,
		titleBarStyle: 'hidden',
		titleBarStyle: 'hiddenInset',
		titleBarStyle: 'customButtonsOnHover',*/
		alwaysOnTop: true,
		width: 400,
		height: 300,
		title: 'Add Shopping Item',
		webPreferences: {
			nodeIntegration: true
		}
	});
	// Load HTML Here
	addWindow.loadURL(url.format({
		pathname : path.join(__dirname,'addwindow.html'),
		protocol : 'file:',
		slashes : true
	}));
	// Grabage Collection handle
	addWindow.on('close', function() {
		addWindow = null;
	});
}

// catch item:add same function below ipc.on
ipcMain.on('item:add',function(e, item) {
	mainWindow.webContents.send('item:add', item);
	addWindow.close();
});

// creating menu Template
const mainMenuTemplate = [
	{
		label:'file',
		submenu: [
			{
				label: 'Add Note',
				accelerator: process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
				click() {
					createAddWindow();
				}
			},
			{
				label:'clear Items',
				click() {
					mainWindow.webContents.send('item:clear');
				}
			},
		      { type: 'separator' },
		      { role: 'hide' },
		      { role: 'hideothers' },
		      { role: 'unhide' },
		      { type: 'separator' },
			{
				label: 'Quit',
				accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
				click() {
					app.quit();
				}
			}
		]
	},
	{
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startspeaking' },
            { role: 'stopspeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://github.com/hunk7/expenditure-diary-electron.js')
        }
      }
    ]
  }
];

// If mac Add empty object to menu
if (process.platform == 'darwin') {
	mainMenuTemplate.unshift({});
}

// Add developer tools Items if not in production
if (process.env.NODE_ENV !== 'production') {
	mainMenuTemplate.push({
		label: 'developer',
		submenu: [
			{
				label: 'Toggle DevTools',
				accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
				click(item , focusedWindow) {  // parameters for perticular window focus
					focusedWindow.toggleDevTools();
				}
			},
			{
				role: 'reload'
			}
		]
	})
}

ipc.on('update-notify-value', function (event, arg) {
	mainWindow.webContents.send('targetPriceVal', arg);
})

ipc.on('update-notify-amount', function (event, arg) {
	mainWindow.webContents.send('targetPriceAmount', arg);
})