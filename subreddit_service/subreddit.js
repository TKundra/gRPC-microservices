require('dotenv').config();
const { Client } = require("pg");
const { PG_USER, PG_PASSWORD, PG_DATABASE } = process.env;

const clientConfig = {
  user: PG_USER,
  password: PG_PASSWORD,
  database: PG_DATABASE,
};

const client = new Client(clientConfig);
client.connect().then(() => console.log('DB connected')).catch((error) => console.error(error.messge));

exports.createSubreddit = function createSubreddit(call, cb) {
  const { name, description } = call.request.subreddit;

  client.query(
    "insert into subreddits(name, description) values($1, $2) returning id",
    [name, description],
    (err, res) => {
      if (err) {
        return cb(err, null);
      } else {
        const response = {
          id: res.rows[0].id,
        };
        return cb(null, response);
      }
    }
  );
};

exports.getSubreddit = function getSubreddit(call, cb) {
  const { id } = call.request;

  client.query(
    "select name, description from subreddits where id = $1",
    [id],
    (err, res) => {
      if (err) {
        return cb(err, null);
      } else {
        const response = {
          subreddit: {
            name: res.rows[0].title,
            description: res.rows[0].description,
            id: id,
          },
        };
        return cb(null, response);
      }
    }
  );
};

/*  subreddit - is a specific online community, and the posts associated with it, on the
    social media website reddit. Subreddits are dedicated to a particular topic that people
    write about, and they're denoted by /r/, followed by the subreddit's name. e.g - /r/gaming. */