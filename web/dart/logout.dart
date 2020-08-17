import 'dart:html';
import 'package:http/http.dart' as http;

void main() async {
  var baseURL = window.location.href;
  baseURL = baseURL.split('//')[0] + '//' + (baseURL.split('//')[1].split('/'))[0];
  var response = await http.post(baseURL + '/api/refresh_token_send/logout/');
  print(response.body);
  window.location.assign(baseURL);
}