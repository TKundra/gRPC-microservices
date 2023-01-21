const protoLoader = require("@grpc/proto-loader");
const grpc = require("@grpc/grpc-js");
const PROTO_PATH = __dirname + "/protos/user.proto";

// package definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
  oneofs: true,
});

// user service definition
const UserService = grpc.loadPackageDefinition(packageDefinition).UserService;

// create client from user service definition
const client = new UserService(
  "localhost:50050",
  grpc.credentials.createInsecure()
);

// auth middleware function
exports.requiresAuth = function requiresAuth(req, res, next) {
  const token = req.headers["authorization"];
  if (!token || token.indexOf("Bearer") == -1) {
    return res.status(401).json({ success: false, msg: 'Bearer token required' })
  }

  client.isAuthenticated({ token: token.split(" ")[1] }, (err, response) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, msg: "user auth error" });
    } else {
      const user = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
      };
      req.user = user;
    }
    next();
  });
};
