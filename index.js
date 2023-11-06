require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json());
const port = 4000;
app.get("/", async (req, res) => {
  res.send("this is the bae .....");
});

// connection with mongodb from here .........
const password = "Volunteer";
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://volunteer:${password}@cluster0.5mwmpl3.mongodb.net/?retryWrites=true&w=majority`;

// verifying the jwt token from here.......

function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send("unauthorized access .............");
  }
  const token = authHeader.split(" ")[1];
  console.log("inside the verify function : ", token);

  jwt.verify(token, process.env.access_token, function (err, decoded) {
    if (err) {
      return res.send("forbidden access ..........");
    }
    req.decoded = decoded;
    next();
  });
}
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    // Connect operation are going from here ...............
    const usersCollection = client.db("Parlour").collection("users");
    const serviceCollection = client.db("Parlour").collection("services");
    const bookingCollection = client.db("Parlour").collection("booking");
    const addServiceCollection = client.db("Parlour").collection("addService");
    const ressionPortal = client.db("Parlour").collection("ressionUsers");
    app.post("/users", async (req, res) => {
      const body = req.body;
      const query = {};
      const result = await usersCollection.insertOne(body);
      // console.log(body);
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });
    // make admin panel here........
    app.put("/users/admin/:id", verifyJwt, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);
      if (user?.role !== "admin") {
        return res.send("forbidden access role ............");
      }
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };

      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        option
      );
      res.send(result);
    });

    // services part of the home......

    app.get("/services", async (req, res) => {
      const query = {};
      const result = await serviceCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/services", async (req, res) => {
      const query = req.body;
      const result = await serviceCollection.insertOne(query);
      res.send(result);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });

    //booking portal will working ,,,,,,

    // booking related................

    app.post("/booking", async (req, res) => {
      const query = req.body;
      const result = await bookingCollection.insertOne(query);
      res.send(result);
    });

    app.get("/booking", verifyJwt, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;
      if (email != decodedEmail) {
        res.send("forbidden access from the /booking ");
      }
      const query = { email: email };
      console.log(req.headers.authorization);
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.findOne(query);
      res.send(result);
    });

    // adding the services from the client .....

    app.post("/addService", async (req, res) => {
      const body = req.body;
      const query = {};
      const result = await addServiceCollection.insertOne(body);
      res.send(result);
    });
    app.get("/addService", async (req, res) => {
      const query = {};
      const result = await addServiceCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/addService/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addServiceCollection.findOne(query);
      res.send(result);
    });

    // update the addservices status as done ......
    app.put("/addService/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = { $set: { status: "done" } }; // Set the status to "done"
      const result = await addServiceCollection.updateOne(query, update);
      res.send(result);
    });

    // ression .......

    ressionPortal.createIndex({ nationalId: 1 }, { unique: true });

    app.get("/ressionUsers", async (req, res) => {
      const query = {};
      const result = await ressionPortal.find(query).toArray();
      res.send(result);
    });

    app.get("/ressionUsers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ressionPortal.findOne(query);
      res.send(result);
    });

    app.put("/ressionUsers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = { $set: { status: "done" } }; // Set the status to "done"
      const result = await ressionPortal.updateOne(query, update);
      res.send(result);
    });

    app.post("/ressionUsers", async (req, res) => {
      const query = req.body;

      try {
        const result = await ressionPortal.insertOne(query);
        res.send(result);
      } catch (error) {
        if (error.code === 11000) {
          res.status(400).send("National ID must be unique.");
        } else {
          res
            .status(500)
            .send("An error occurred while processing your request.");
        }
      }
    });

    // jwt operations are started from here ...

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.access_token);
        return res.send({ accessToken: token });
      }

      res.send({ access_token: "user not foundoo" });
      // console.log(user)
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`app is running at ${port}`);
});
