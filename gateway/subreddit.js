const express = require("express");
const router = express.Router();

const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");
const PROTO_PATH = __dirname + "/protos/subreddit.proto";
const { requiresAuth } = require("./auth");

// package definitions
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

// Load Definition into gRPC
const SubRedditService = grpc.loadPackageDefinition(packageDefinition).SubRedditService;

// create client from subReddit service definition - later you can use methods of it
const client = new SubRedditService(
  "localhost:50052",
  grpc.credentials.createInsecure()
);

// routes, and response will be returned from subreddit_service that we passing in cb(err, response)
router.post("/", requiresAuth, (req, res) => {
  const { name, description } = req.body;

  const createSubredditRequest = {
    subreddit: {
      name,
      description,
    },
  };
  
  client.createSubReddit(createSubredditRequest, (err, msg) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ success: false, msg: "create subreddit error" });
    } else {
      return res
        .status(200)
        .json({ success: true, msg: "subreddit created", id: msg.id });
    }
  });
});

module.exports = router;