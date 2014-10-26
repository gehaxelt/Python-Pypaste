#!/usr/bin/python

from flask import Flask, request, jsonify
from config import PyPasteConfig
import re, time, hashlib, os


config = PyPasteConfig()
app = Flask(__name__)

# Send index.html
@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/createpaste', methods=['POST'])
def createPaste():
    
    # Check if it's a XHR request
    if not request.is_xhr:
        return 'Not allowed', 403
    
    data = request.form['data']
    burn = request.form['burn']
    expiration = int(request.form['expiration'])

    # Check if it's hex-only
    if not hex_regex.match(data):
        return jsonify({'error': 'Invalid hex format'}), 200

    if not (burn == "true" or burn == "false"):
      return jsonify({'error': 'Invalid value for burn'}), 200

    if (expiration <= 0) or (expiration > config.getMaxLifeTime()):
      return jsonify({'error': 'Bad expiration value chosen.'}), 200

    # Check max-length
    if len(data) >= config.getMaxPasteSize():
        return jsonify({'error':'Too big'}), 200

    #Get the current timestamp
    timestamp = time.time()
    pastehash = hashlib.md5(str(str(timestamp) + data + burn + request.remote_addr).encode('utf-8')).hexdigest()
    pastepath = os.path.join('data',pastehash + '.data')

    if os.path.exists(pastepath):
        return jsonify({'error':'Hash collision. Please try again'}), 200

    pastefile = open(pastepath,"w")
    pastefile.write(str(timestamp) + "\n")
    pastefile.write(str(burn) + "\n")
    pastefile.write(str(expiration*60) + "\n")
    pastefile.write(data + "\n")
    pastefile.close()

    increasePastecount()
    return jsonify({'error': None, 'hash': pastehash}), 200

@app.route('/api/retrievepaste', methods=['POST'])
def retrievePaste():
    # Check if it's a XHR request
    if not request.is_xhr:
        return 'Not allowed', 403
    
    pastehash = request.form['hash']

    # Check if it's hex-only
    if not hex_regex.match(pastehash):
        return jsonify({'error': 'Invalid hash format'}), 200

    pastepath = os.path.join('data',pastehash + '.data')

    if not os.path.exists(pastepath):
        return jsonify({'error':'Paste does not exist anymore'}), 200

    timestamp = int(float(time.time()))
    pastefile = open(pastepath,"r")
    pastetime = int(float(pastefile.readline().strip())) #Timestamp
    pasteburn = pastefile.readline().strip() #Burn after reading
    pasteexp = int(pastefile.readline().strip()) #Expiration
    pastedata = pastefile.readline().strip() #Encrypted data
    pastefile.close()

    if pasteburn == "true":
      pasteburn = True
    else:
      pasteburn = False

    if (timestamp >= (config.getMaxLifeTime() + pastetime)) or \
      (timestamp >= (pasteexp + pastetime)):
        os.remove(pastepath)
        return jsonify({'error':'Paste does not exist anymore'}), 200

    if pasteburn:
        os.remove(pastepath)

    return jsonify({'error':None,'data':pastedata, 'burn': pasteburn}), 200

@app.route('/api/getpastecount', methods=['GET'])
def getPastecount():
    return jsonify({'count': pastecount}), 200

def initPastecount():
    countfile.seek(0)
    count = countfile.readline().strip()
    if count != "":
        pastecount = int(count)
    else:
        pastecount = 0
    return pastecount

def increasePastecount():
    global pastecount
    pastecount = pastecount + 1
    countfile.seek(0)
    countfile.write(str(pastecount) + "\n")
    countfile.flush()

hex_regex = re.compile('^[a-zA-Z0-9]+$')
if(os.path.exists(os.path.join('data','pastecount.txt'))):
    countfile = open(os.path.join('data','pastecount.txt'),'r+')
else:
    countfile = open(os.path.join('data','pastecount.txt'),'w+')
pastecount = initPastecount()

if __name__ == '__main__':
    app.run(host = config.getHost(),
            port = config.getPort(),
            debug = config.getDebug()
            )