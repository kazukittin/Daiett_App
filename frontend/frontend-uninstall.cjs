// frontend-uninstall.cjs
const Service = require('node-windows').Service;

const svc = new Service({
    name: 'DaiettFrontendService',                 // frontend-service.cjs と同じ name
    script: 'F:\\Daiett_App\\frontend\\frontend-server.cjs',
});

svc.on('uninstall', () => {
    console.log('Frontend service uninstalled');
});

svc.uninstall();


//cd F:\Daiett_App\frontend
//node .\frontend-uninstall.cjs
