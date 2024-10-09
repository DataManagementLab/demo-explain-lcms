import ky from 'ky';

const api = ky.extend({
  retry: 0,
  timeout: false,
  prefixUrl: 'http://127.0.0.1:8000/',
});

export default api;
