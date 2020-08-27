import 'protected.dart' as protected;
import 'getUri.dart' as getUri;
import 'dart:html';
import 'package:http/http.dart' as http;

void main() async {
  var logged_in = await protected.user_logged_in();
  //Get posts from database
}