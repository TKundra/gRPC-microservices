const express = require("express");
const router = express.Router();
const { requiresAuth } = require("./auth");

const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");
const PROTO_PATH = __dirname + "/protos/post.proto";

// package definitions
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

// Load Definition into gRPC
const PostService = grpc.loadPackageDefinition(packageDefinition).PostService;

// create client from post service definition - later you can use methods of it
const client = new PostService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// routes, and response will be returned from post_service that we passing in cb(err, response)
router.post("/comment/:id", (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  const commentPostRequest = {
    id,
    comment,
    user_id: req.user.id,
  };

  client.commentPost(commentPostRequest, (err, msg) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, msg: "comment post error" });
    } else {
      return res.status(200).json({ success: true, id: msg.id });
    }
  });
});

router.get("/like/:id", requiresAuth, (req, res) => {
  const { id } = req.params;
  client.likePost({ id, user_id: req.user.id }, (err, msg) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, msg: "like post error" });
    } else {
      return res.status(200).json({ success: true, id: msg.id });
    }
  });
});

router.put("/:id", requiresAuth, (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const updatePostRequest = {
    id,
    post: {
      title,
      description,
    },
    user_id: req.user.id,
  };

  client.updatePost(updatePostRequest, (err, msg) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, msg: "update post error" });
    } else {
      return res.status(200).json({ success: true, id: msg.id });
    }
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  client.getPost({ id }, (err, msg) => {
    if (err) {
      return res.status(500).json({ success: false, msg: err.details || err });
    } else {
      return res
        .status(200)
        .json({ success: true, post: msg.post, comments: msg.comments });
    }
  });
});

router.post("/", requiresAuth, (req, res) => {
  const { title, description, subreddit_id } = req.body;
  if (!title || !description || !subreddit_id)
  return res
  .status(401)
  .json({ success: false, msg: "missing fields to register user" });

  const createPostRequest = {
    post: {
      title,
      description,
      subreddit_id,
      author: req.user.id,
    },
  };

  client.createPost(createPostRequest, (err, msg) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, msg: "create post error" });
    } else {
      return res
        .status(200)
        .json({ success: true, msg: "post created", id: msg.id });
    }
  });
});

module.exports = router;