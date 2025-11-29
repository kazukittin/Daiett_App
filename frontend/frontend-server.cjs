// frontend-server.cjs
const express = require('express');
const path = require('path');

const app = express();

// ビルド済みのファイルがある場所
const distPath = path.join(__dirname, 'dist');

// 静的ファイルを配信
app.use(express.static(distPath));

// SPA 想定で、どのパスでも index.html を返す
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// 好きなポートでOK（ここでは 5173）
const PORT = 5173;

app.listen(PORT, () => {
    console.log(`Frontend running at http://localhost:${PORT}`);
});
