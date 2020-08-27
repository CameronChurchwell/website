import 'package:http/http.dart' as http;
import 'getUri.dart' as getUri;
import 'dart:html';

Future<bool> user_logged_in() async {
  var uri = getUri.uriFromPath('/api/protected/user_logged_in/');
  var request = http.Request('GET', uri);
  var response = await protected_request_send(request);
  print(response.statusCode);
  if (response.statusCode == 200) {
    return true;
  } else {
    return false;
  }
}

Future<http.Response> send_request(http.BaseRequest request) async {
  var responseStream = await request.send();
  var response = await http.Response.fromStream(responseStream);
  return response;
}

Future<http.Response> protected_request_send(http.BaseRequest request) async {
  var response = await send_request(request); //Get Response
  if (response.statusCode == 200) { //Success!
    return response;
  } else if (response.statusCode == 401) { //Invalid Access Token
    var accessTokenUri = getUri.uriFromPath('/api/refresh_token_send/get_access_token');
    var accessTokenRequest = http.Request('GET', accessTokenUri);
    var accessTokenResponse = await send_request(accessTokenRequest);
    if (accessTokenResponse.statusCode == 200) { //Got New Access Token, Trying Again
      var newRequest = http.Request(request.method, request.url);
      var response = await send_request(newRequest); //Get Response
      if (response.statusCode == 200) { //Success!
        return response;
      } else { //Invalid Access Token (this shouldn't really happen, we just got a new one)
        return response;
      }
    } else { //Invalid Refresh Token (user not signed in)
      return response;
    }
  } else if (response.statusCode == 403) { //User Missing Permissions
    return response;
  }
  return response;
}
