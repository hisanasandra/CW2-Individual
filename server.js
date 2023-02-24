const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

app.use(express.json());

app.set("path", 3000);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});
const MongoClient = require("mongodb").MongoClient;

let db;
MongoClient.connect(
  "mongodb+srv://sandra:090902@cluster0.hgtnqe6.mongodb.net/test",
  (err, client) => {
    db = client.db("webstore");
  }
);

app.use(express.static("public"));

app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  return next();
});

app.get("/collection/:collectionName", (req, res, next) => {
  req.collection.find({}).toArray((e, results) => {
    if (e) return next(e);
    res.send(results);
  });
  console.log(new Date() + " Classes Data Sent");
});

app.post("/collection/:collectionName", (req, res, next) => {
  req.collection.insert(req.body, (e, results) => {
    if (e) return next(e);
    res.send(results.ops);
  });
  console.log(new Date() + " Order Placed Successfully!");
});

const ObjectID = require("mongodb").ObjectId;
app.get("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
    if (e) return next(e);
    res.send(result);
  });
});

app.get("/images/:file", function (req, res, next) {
  let file = req.params.file;
  var filePath = path.join(__dirname, "public/images/", file);
  fs.stat(filePath, function (err, fileInfo) {
    if (err) {
      res.status(404).send({ message: "File Not Found!" });
      console.log(new Date() + " File Not Found!");
    } else {
      res.sendFile(path.join(__dirname, "public\\images\\" + file));
      console.log(new Date() + " Image Accessed");
    }
  });
});

app.put("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.update(
    { _id: new ObjectID(req.params.id) },
    { $set: req.body },
    { safe: true, multi: false },
    (e, result) => {
      if (e) return next(e);
      res.send(result ? { msg: "success" } : { msg: "error" });
    }
  );
});

app.post("/collection/:collectionName/search", (req, res, next) => {
  const data = req.body.search;
  req.collection
    .find({ subject: { $regex: new RegExp("^" + data.toLowerCase(), "i") } })
    .toArray((e, results) => {
      if (e) return next(e);
      res.send(results);
    });
  console.log(new Date() + " Searching Classes");
});

app.listen(3000, () => {
  console.log(new Date() + " Listening on port 3000");
});
