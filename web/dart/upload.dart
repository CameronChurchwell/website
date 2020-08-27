import 'dart:html';
import 'protected.dart' as protected;
import 'package:http/http.dart' as http;
import 'getUri.dart' as getUri;
import 'dart:convert' show utf8;

void main() async {
  querySelector('#upload-form').onSubmit.listen((Event e) async { //Wait for user to hit submit
    var files = (querySelector('#file-input') as InputElement).files;
    if (files.length == 1) { //User Uploaded One File (the only outcome we accept)
      var file = files[0];
      var reader = FileReader(); //Create new file reader to read the file
      reader.onLoad.listen((Event e) async { //Called when the reader finishes reading
        var result = await upload(reader.result.toString());
        print(result);
      });
      await reader.readAsArrayBuffer(file); //Read the file as text (a string)
    } else if (files.isEmpty) { //User did not upload a file //TODO handle this
      print('No file selected!');
    } else { //The user uploaded too many files //TODO handle this!!!
      print('Too many files!');
    }
    e.preventDefault();
  });
}

Future<bool> upload(String zip_file_string) async {
  var uri = getUri.uriFromPath('/api/protected/blog/upload/');
  var request = http.MultipartRequest('POST', uri);
  var multipart_file = http.MultipartFile.fromString('zip_file', zip_file_string);
  request.files.add(multipart_file);
  print('test');
  var response = await protected.protected_request_send(request);
  print(response.statusCode);
  return false;
}