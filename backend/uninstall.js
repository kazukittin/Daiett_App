import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { Service } = require('node-windows');

const scriptPath = 'C:\\path\\to\\Daiett_App\\backend\\server.js';

const svc = new Service({
    name: 'DaiettBackend',
    script: scriptPath
});

svc.on('uninstall', () => {
    console.log('Service uninstalled');
});

svc.uninstall();



//cd C:\（実際のパス）\Daiett_App\backend
//node uninstall.js
