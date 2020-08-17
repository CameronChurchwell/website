import 'package:http/http.dart' as http;
import 'dart:html';

Future<http.Response> protected_get(url) async {
  //try to get on url
  //if response success return response
  //else (401) try to get a new access token
    //or if user not authorized (403) return that instead
  //if getting a new access token succeeded, try accessing the 
  //else return that response, which will tell the client to redirect to login
  var response = await http.get(url);
  if (response.statusCode == 200) {
    print('Request succeeded!');
    return response;
  } else if (response.statusCode == 401) { //Invalid access_token
    var baseURL = url.split('//')[0] + '//' + (url.split('//')[1].split('/'))[0]; //Base site url
    response = await http.get(baseURL + '/api/refresh_token_send/get_access_token/'); //Try to get new access_token using refresh_token
    if (response.statusCode == 401) { //Invalid refresh_token
      print('Bad refresh token!');
      return response;
    } else if (response.statusCode == 200) { //Got new access_token, recurse to try again getting protected resource
      print('Got access token, trying again!');
      return await protected_get(url);
    } else { //This really shouldn't happen, but just in case
      return response;
    }
  } else if (response.statusCode == 403) { //User permission denied
    return response;
  } else { //Not 401 or 403. Could be a different error, but auth was not the issue
    return response;
  }
}

Future<bool> user_logged_in() async {
  var currentURL = window.location.href;
  var baseURL = currentURL.split('//')[0] + '//' + (currentURL.split('//')[1].split('/'))[0];
  var response = await protected_get(baseURL + '/api/protected/user_logged_in/');
  print(response.statusCode);
  if (response.statusCode == 200) {
    return true;
  } else {
    return false;
  }
}

Future<http.Response> protected_post(url, body) {
  return null;
}
