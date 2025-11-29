// service.js
import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);
const { Service } = require('node-windows');

const backendDir = 'F:\\Daiett_App\\backend';
const scriptPath = path.join(backendDir, 'server.js'); // ★ ここが本体サーバー

const svc = new Service({
    name: 'DaiettBackendService',
    displayName: 'DaiettBackend',
    description: 'Daiett App Backend (Node.js on Windows)',
    script: scriptPath,
    workingDirectory: backendDir,
    env: [
        { name: 'NODE_ENV', value: 'production' },
    ],
    logpath: path.join(backendDir, 'logs'),
});

svc.on('install', () => {
    console.log('Service installed');
    svc.start();
});

svc.on('start', () => {
    console.log('Service started');
});

svc.on('alreadyinstalled', () => {
    console.log('Service already installed');
});

svc.on('error', (err) => {
    console.error('Service error:', err);
});

svc.install();
