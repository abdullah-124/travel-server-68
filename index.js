const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/public'));
const PORT = process.env.PORT || 4004;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.llmdc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log(uri);
app.get("/", (req, res) => {
  res.send("travel server is running");
});
app.get("/server", (req, res) => {
  res.send("travel server");
});


async function run() {
  try {
    await client.connect();
    const database = client.db("travel");
    const servicesCollection = database.collection("services");
    const ordersCollection = database.collection("orders");
    const reviewsCollection = database.collection("reviwes")

    app.get("/services", async (req, res) => {
      const cursor = await servicesCollection.find({});
      const services = await cursor.toArray();
      res.json(services);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.json(service);
    });

    //service add using post
    app.post("/addService", async (req, res) => {
      console.log(req);
      const service = req.body;
      // console.log('hitting the post', service)
      const result = await servicesCollection.insertOne(service);
      // console.log(result);
      res.send(result);
    });

    // addd service in order section
    app.post("/order", async (req, res) => {
    //   console.log('hitting order function')
      const order = req.body;
    //   console.log(order)
      const result = await ordersCollection.insertOne(order);
      // console.log(result)
      res.send(result);
    });

    app.get("/manageOrder", async (req, res) => {
      const cursor = await ordersCollection.find({});
      const orders = await cursor.toArray();
      res.json(orders);
    });

    app.get("/myOrder/:email", async (req, res) => {
      const email = req.params.email;
      // console.log(email)
      const query = { email: email };
      const result = await ordersCollection.find(query);
      const orders = await result.toArray();
      res.json(orders);
    });

    app.delete("/myOrder/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: id };
      const result = await ordersCollection.deleteOne(query);
      // console.log(result);
      res.send(result);
    });

    //UPDATE STATUS
    app.put("/manageOrder/:id", async (req, res) => {
      const id = req.params.id;
      const order = req.body;
      // console.log(order)
      order.status = "Approved";
      const query = { _id: id };
      // const replacemant = {order}
      const result = await ordersCollection.replaceOne(query, order);
      res.send(result);

      // console.log('hit the put ',id)
    });

    // review section 
    app.post('/review', async(req, res)=>{
      // console.log('hitting the review')
      const review = req.body;
      // console.log(review)
      const result = await reviewsCollection.insertOne(review)
      res.send(result)
    })
    // get review 
    app.get('/review', async(req, res)=>{
      const cursor = await reviewsCollection.find({})
      const result = await cursor.toArray() 
      res.json(result)
    })

  } finally {
  }
}
run().catch(console.dir);
app.listen(PORT, () => {
  console.log("server running in PORT number ", PORT);
});
