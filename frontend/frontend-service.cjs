// frontend-service.cjs
const path = require('path');
const Service = require('node-windows').Service;

const frontendDir = 'F:\\Daiett_App\\frontend';
const scriptPath = path.join(frontendDir, 'frontend-server.cjs');

const svc = new Service({
    name: 'DaiettFrontendService',     // サービス内部名（英語・スペースなし）
    displayName: 'DaiettFrontend',     // サービス一覧に表示される名前
    description: 'Daiett App Frontend (static files via Express)',
    script: scriptPath,
    workingDirectory: frontendDir,
    env: [
        { name: 'NODE_ENV', value: 'production' },
    ],
    logpath: path.join(frontendDir, 'logs'), // ログ保存先
});

// イベントハンドラ
svc.on('install', () => {
    console.log('Frontend service installed');
    svc.start();
});

svc.on('start', () => {
    console.log('Frontend service started');
});

svc.on('alreadyinstalled', () => {
    console.log('Frontend service already installed');
});

svc.on('error', (err) => {
    console.error('Frontend service error:', err);
});

svc.install();
