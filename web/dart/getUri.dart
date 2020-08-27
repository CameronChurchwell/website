import 'dart:html';


Uri uriFromPath(String path) {
  if (window.location.protocol == 'https:') {
    return Uri.https(window.location.hostname + ':' + window.location.port, path);
  } else if (window.location.protocol == 'http:') {
    return Uri.http(window.location.hostname + ':' + window.location.port, path);
  }
  return null;
}