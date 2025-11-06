from flask import Flask, jsonify, request
from flask_cors import CORS
from auth.login import auth as auth_bp

app = Flask(__name__)
app.secret_key = "replace-with-secure-random-secret"  # use a secure, env-based value
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

app.register_blueprint(auth_bp, url_prefix="/auth")


@app.route("/")
def welcome():
    return "MWAHAHAHAHAHA"

@app.route("/items/", methods = ['GET'])
def get_item():
    return items

if __name__ == "__main__":
    app.run(debug = True)