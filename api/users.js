import { _get, _post } from 'api';

export function RequestPasswordResetRequest({ email }) {
  return _post('/api/request_password_reset', {
    email,
  });
}

export function RegisterRequest(params) {
  return _post('/api/register', params);
}

export function GetAccountRequest() {
  return _get('/api/account');
}
