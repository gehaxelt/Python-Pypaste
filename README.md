PyPaste
===============

An encrypted pastebin written in python using flask.

#Features

- Encrypts all pasted data with AES-256-CBC on the clientside, so the service provider can't snoop into your pastes
- Pastes are stored on the harddisk, so no database is needed
- Keys are stored in location.hash, thus not transmitted to the server
- "Burn after reading":  Deletes a paste after the first visit
- Automatic expiration: User can choose how long the paste is valid
- Syntaxhighlighting: Highlightjs does the job
- Awesome Bootstrap design ;)
- Size-limit: Provider can limit a paste's size
- Expiration-limit: Provider can limit the expiration limit
- W3C compliant
- Built-in webserver

#Requirements

- python 3.4.2
- Flask
- git

#Setup

- Clone the repository: ```git clone https://github.com/gehaxelt/Python-Pypaste.git pypaste && cd pypaste```
- Install virtualenv: ```sudo pip install virtualenv``` 
- Run ```virtualenv env```
- Run ```. venv/bin/activate```
- Install Flask: ```pip install Flask```

#Configuration

- Copy ```config.py.example``` to ```config.py``` and edit the parameters in the constructor.
- Create a writeable directory ```data/```

#Run

- To start the pastebin, run ```python app.py```.

#Contribution

If you discover any bugs or you have any awesome ideas, feel free to fork this repository. Pure awesomeness, if you decide to share your changes with me. The best way is to create a new feature branch:

- ```git checkout -b feature_foo``` and implement your new feature

Then send me a pull request pointing to your feature-branch.  

#License

This project is released under the MIT License.