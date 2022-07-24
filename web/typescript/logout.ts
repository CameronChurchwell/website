fetch('/api/protected/user_logged_in');

fetch('/api/refresh_token_send/logout/', {
    method: 'POST'
});

location.assign('/');