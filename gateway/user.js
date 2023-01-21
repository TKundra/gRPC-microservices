const express = require("express");
const router = express.Router();

const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");
const PROTO_PATH = __dirname + "/protos/user.proto";
const { requiresAuth } = require("./auth");

// package definitions
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

// Load Definition into gRPC
const UserService = grpc.loadPackageDefinition(packageDefinition).UserService;

// create client from user service definition - later you can use methods of it
const client = new UserService(
  "localhost:50050",
  grpc.credentials.createInsecure()
);

// routes, and response will be returned from user_service that we passing in cb(err, response)
router.get("/:id", requiresAuth, (req, res) => {
  const { id } = req.params;

  client.getUser({ id }, (err, response) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, msg: "get user error" });
    } else {
      if (!response.user)
        return res.status(404).json({ success: true, msg: "user not found" });
      else return res.status(200).json({ success: true, user: response.user });
    }
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const createTokenRequest = {
    user: {
      email,
      password,
    },
  };

  client.createToken(createTokenRequest, (err, response) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, msg: err.details || err || 'Create token error' });
    } else {
      return res.status(200).json({ success: true, token: response.token });
    }
  });
});

router.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res
      .status(401)
      .json({ success: false, msg: "missing fields to register user" });

  const createUserRequest = {
    user: {
      email,
      username,
      password,
    },
  };
  client.createUser(createUserRequest, (err, response) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, msg: "user auth error" });
    } else {
      return res
        .status(200)
        .json({ success: true, msg: "user created", id: response.id });
    }
  });
});

module.exports = router;
