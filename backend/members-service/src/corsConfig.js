const ALLOWED_ORIGINS = [
  'https://main.dsja0wb3dtu47.amplifyapp.com',
  'http://localhost:4200',
  'http://127.0.0.1:4200'
];

function corsOptions() {
  return {
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true
  };
}

module.exports = { corsOptions };
