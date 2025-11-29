// service.cjs
const path = require('path');
const Service = require('node-windows').Service;

const backendDir = 'F:\\Daiett_App\\backend';
const scriptPath = path.join(backendDir, 'server.js');

// Windows サービスの設定
const svc = new Service({
    name: 'DaiettBackendService',       // サービスの内部名
    displayName: 'DaiettBackend',       // サービス一覧に出る名前
    description: 'Daiett App Backend (Node.js on Windows)',
    script: scriptPath,                 // 実行する server.js
    workingDirectory: backendDir,       // カレントディレクトリ
    env: [
        {
            name: 'NODE_ENV',
            value: 'production',
        },
    ],
    logpath: path.join(backendDir, 'logs'), // ログフォルダ
});

// イベントハンドラ
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
