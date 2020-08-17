import 'protected.dart' as protected;
import 'dart:html';
import 'package:http/http.dart' as http;

void main() async {
  var logged_in = await protected.user_logged_in();
  print('Result of user_logged_in: ' + logged_in.toString());
  //var baseURL = window.location.href;
  //baseURL = baseURL.split('//')[0] + '//' + (baseURL.split('//')[1].split('/'))[0];
  //var logged_out0 = await http.post(baseURL + '/api/refresh_token_send/delete_refresh_token');
  //var logged_out1 = await http.get(baseURL + '/api/protected/delete_access_token');
  //print(logged_out0.body + ' : ' + logged_out1.body);
  //var logged_out = await http.post(baseURL + '/api/refresh_token_send/logout/');
  //print('Result of logged_out: ' + logged_out.body);
}