import http from 'http';

const HTML = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <title>Preview iOS – App Igreja</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: #111;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, sans-serif;
      gap: 16px;
    }

    .label {
      color: #666;
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    /* ── iPhone 15 Pro shell ── */
    .phone {
      position: relative;
      width: 393px;
      height: 852px;
      background: #1a1a1a;
      border-radius: 54px;
      box-shadow:
        0 0 0 1.5px #3a3a3a,
        0 0 0 3px #111,
        0 0 0 4px #2a2a2a,
        0 40px 80px rgba(0,0,0,.8);
      overflow: hidden;
    }

    /* screen bezel */
    .screen {
      position: absolute;
      inset: 6px;
      background: #000;
      border-radius: 48px;
      overflow: hidden;
    }

    /* Dynamic Island */
    .dynamic-island {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 36px;
      background: #000;
      border-radius: 20px;
      z-index: 10;
    }

    /* app iframe */
    .app-frame {
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 48px;
    }

    /* side buttons */
    .btn {
      position: absolute;
      background: #2a2a2a;
      border-radius: 3px;
    }
    .btn-power {
      right: -4px;
      top: 160px;
      width: 4px;
      height: 80px;
    }
    .btn-vol-up {
      left: -4px;
      top: 130px;
      width: 4px;
      height: 50px;
    }
    .btn-vol-down {
      left: -4px;
      top: 195px;
      width: 4px;
      height: 50px;
    }
    .btn-silent {
      left: -4px;
      top: 100px;
      width: 4px;
      height: 30px;
    }

    /* home indicator */
    .home-bar {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 5px;
      background: rgba(255,255,255,0.3);
      border-radius: 3px;
      z-index: 10;
    }

    .hint {
      color: #444;
      font-size: 11px;
      text-align: center;
    }
  </style>
</head>
<body>
  <p class="label">App Igreja · Preview iOS</p>

  <div class="phone">
    <div class="btn btn-silent"></div>
    <div class="btn btn-vol-up"></div>
    <div class="btn btn-vol-down"></div>
    <div class="btn btn-power"></div>

    <div class="screen">
      <div class="dynamic-island"></div>
      <iframe
        class="app-frame"
        src="http://localhost:8082"
        title="App Igreja"
      ></iframe>
      <div class="home-bar"></div>
    </div>
  </div>

  <p class="hint">Na tela de login, clique em "Modo preview (sem Supabase)" para entrar</p>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(HTML);
});

server.listen(3000, () => {
  console.log('Preview iOS disponível em http://localhost:3000');
});
