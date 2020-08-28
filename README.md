A simple [website](https://www.cameronchurchwell.com) I have created to share my creations with those who may be interested!

Run the dev_install.sh script to install the necessary dependencies.

In order to run the build servers run the following commands in seperate terminal tabs:

```pub run build_runner watch  --output build```

```sass --watch assets/scss/:assets/css/```

Then to run the Flask server itself run the following command in the server directory:

```FLASK_APP=web_app.py FLASK_DEBUG=1 python -m flask run -p 5050```

Created from templates made available by Stagehand under a BSD-style
[license](https://github.com/dart-lang/stagehand/blob/master/LICENSE).
