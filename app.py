#!/usr/bin/python

from flask import Flask, request, jsonify
from config import PyPasteConfig
import re


config = PyPasteConfig()
app = Flask(__name__)

hex_regex = re.compile('^[a-zA-Z0-9]+$')

# Send index.html
@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/createpaste', methods=['POST'])
def create_paste():
    
    # Check if it's a XHR request
    if not request.is_xhr:
        return 'Not allowed', 403
    
    data = request.form['data']

    # Check if it's hex-only
    if not hex_regex.match(data):
      return jsonify({'error': 'Invalid hex format'}), 200

    # Check max-length
    if len(data) >= config.getMaxPasteSize():
        return jsonify({'error':'Too big'}), 200

    return data, 200


if __name__ == '__main__':
    app.run(host = config.getHost(),
            port = config.getPort(),
            debug = config.getDebug()
            )