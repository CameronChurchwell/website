import 'dart:convert';
import 'dart:html';
import 'package:http/http.dart' as http;

void main() {

  querySelector('#login-form').onSubmit.listen((Event e) {
    login((querySelector('#email') as InputElement).value, (querySelector('#password') as InputElement).value);
    e.preventDefault();
  });

}

void login(email, password) async {
  var baseURL = window.location.href;
  baseURL = baseURL.split('//')[0] + '//' + (baseURL.split('//')[1].split('/'))[0];
  var postURL = baseURL + '/api/login/';
  var response = await http.post(postURL, body: jsonEncode({'email' : email, 'password' : password}));
  if (response.body == 'True') {
    var getURL = baseURL + '/api/refresh_token_send/get_access_token/';
    response = await http.get(getURL);
    if (response.body == 'True') {
      window.location.assign(baseURL);
    }
  }
}