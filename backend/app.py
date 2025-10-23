from flask import Flask, jsonify, request;

app = Flask(__name__)

@app.route("/")
def welcome():
    return "MWAHAHAHAHAHA"

@app.route("/items/", methods = ['GET'])
def get_item():
    return items

if __name__ == "__main__":
    app.run(debug = True)