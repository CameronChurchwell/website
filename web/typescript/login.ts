const login_form = document.querySelector("#login-form");

login_form?.addEventListener("submit", login);


async function login(this: HTMLElement, ev: Event) {
    const email_field = this.querySelector('#email') as HTMLInputElement;
    const password_field = this.querySelector('#password') as HTMLInputElement;

    const payload = JSON.stringify({
        'email': email_field.value,
        'password': password_field.value
    });

    ev.preventDefault()

    var response = await fetch('/api/login/', {
        method: 'POST',
        body: payload,
    });

    if (response.body !== null) {
        var body = await response.text()
        if (body == 'True') {
            response = await fetch('/api/refresh_token_send/get_access_token/', {
                method: 'GET'
            })
    
            body = await response.text();
            if (body == 'True') {
                window.location.assign('/');
            }
        }
    }
}
