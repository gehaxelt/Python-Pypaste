#!/usr/bin/python

from flask import Flask
from config import PyPasteConfig

config = PyPasteConfig()
app = Flask(__name__)

@app.route('/')
def index():
    return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(host = config.getHost(),
            port = config.getPort(),
            debug = config.getDebug()
            )