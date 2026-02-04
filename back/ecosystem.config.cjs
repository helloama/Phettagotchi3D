module.exports = {
  apps: [
    {
      name: 'notblox-test',
      script: 'dist/back/src/sandbox.js',
      env: {
        NODE_ENV: 'production',
        GAME_PORT: 8001,
        GAME_SCRIPT: 'defaultScript.js',
        GAME_TICKRATE: 20,
        PLAYER_AVATAR_URL: '/assets/avatars/phettav5.vrm',
        FRONTEND_URL: 'https://3d.phetta.lol',
        SSL_KEY_FILE: '/etc/letsencrypt/live/api.phetta.lol/privkey.pem',
        SSL_CERT_FILE: '/etc/letsencrypt/live/api.phetta.lol/fullchain.pem'
      }
    },
    {
      name: 'notblox-obby',
      script: 'dist/back/src/sandbox.js',
      env: {
        NODE_ENV: 'production',
        GAME_PORT: 8002,
        GAME_SCRIPT: 'parkourScript.js',
        GAME_TICKRATE: 20,
        PLAYER_AVATAR_URL: '/assets/avatars/phettav5.vrm',
        FRONTEND_URL: 'https://3d.phetta.lol',
        SSL_KEY_FILE: '/etc/letsencrypt/live/api.phetta.lol/privkey.pem',
        SSL_CERT_FILE: '/etc/letsencrypt/live/api.phetta.lol/fullchain.pem'
      }
    },
    {
      name: 'notblox-football',
      script: 'dist/back/src/sandbox.js',
      env: {
        NODE_ENV: 'production',
        GAME_PORT: 8003,
        GAME_SCRIPT: 'footballScript.js',
        GAME_TICKRATE: 20,
        PLAYER_AVATAR_URL: '/assets/avatars/phettav5.vrm',
        FRONTEND_URL: 'https://3d.phetta.lol',
        SSL_KEY_FILE: '/etc/letsencrypt/live/api.phetta.lol/privkey.pem',
        SSL_CERT_FILE: '/etc/letsencrypt/live/api.phetta.lol/fullchain.pem'
      }
    },
    {
      name: 'notblox-petsim',
      script: 'dist/back/src/sandbox.js',
      env: {
        NODE_ENV: 'production',
        GAME_PORT: 8004,
        GAME_SCRIPT: 'petSimulatorScript.js',
        GAME_TICKRATE: 20,
        PLAYER_AVATAR_URL: '/assets/avatars/phettav5.vrm',
        FRONTEND_URL: 'https://3d.phetta.lol',
        SSL_KEY_FILE: '/etc/letsencrypt/live/api.phetta.lol/privkey.pem',
        SSL_CERT_FILE: '/etc/letsencrypt/live/api.phetta.lol/fullchain.pem'
      }
    }
  ]
}
