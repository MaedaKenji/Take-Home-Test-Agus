export const login = (data) => import('./api').then(m => m.default.post('/auth/login', data));
export const getMe = () => import('./api').then(m => m.default.get('/auth/me'));
