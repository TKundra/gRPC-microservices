const { startGrpcServer, getGrpcServer } = require("./grpc");
const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");
const PROTO_PATH = __dirname + "/protos/post.proto";
const {
  createPost,
  getPost,
  updatePost,
  likePost,
  commentPost,
} = require("./post");

// add propto file path and boilerplate code
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

// load package definition
const post_proto = grpc.loadPackageDefinition(packageDefinition);

// starting server
startGrpcServer();
const server = getGrpcServer();

// mapping functions with proto services. Naming should be done in camel case.
server.addService(post_proto.PostService.service, {
  createPost,
  getPost,
  updatePost,
  likePost,
  commentPost,
});
