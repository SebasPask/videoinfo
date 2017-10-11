const electron = require('electron');
const ffmpeg = require('fluent-ffmpeg');
const {app, BrowserWindow, ipcMain, Menu} = electron;

let mainWindow;
let addWindow;


app.on('ready',() => {
  mainWindow = new BrowserWindow({});
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.on('closed',()=>app.quit());
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
});
ipcMain.on('video:submit',(event,path)=>{
  ffmpeg.ffprobe(path,(err,metadata)=>{
    mainWindow.webContents.send('video:metadata',metadata.format.duration);
  });
});
function createAddWindow(){
  addWindow = new BrowserWindow({
    width:300,
    height:200,
    title:'Add New Video'
  });
  addWindow.loadURL(`file://${__dirname}/add.html`);
  addWindow.on('closed',()=> addWindow = null);
}
ipcMain.on('new:video', (event, video) => {
  mainWindow.webContents.send('new:video', video);
  addWindow.close();
});
const menuTemplate = [
  {
    label:'File',
    submenu:[
      {label:'New video',click(){createAddWindow();}},
      {label:'Clear videos',click(){mainWindow.webContents.send('clear:videos');}},
      {label:'Quit',accelerator:process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q' ,click(){app.quit();}}
    ]
  }
];
if(process.platform === 'darwin'){
  menuTemplate.unshift({});
}
if(process.env.NODE_ENV !== 'production'){
  menuTemplate.push({
    label:'View',
    submenu:[
      { role:'reload' },
      {
        label:'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I',
        click(item,focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}
