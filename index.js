const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
// const corsOptions = {
//   origin: "*",
//   credentials: true,
//   optionSuccessStatus: 200,
// };
// app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


const uri = process.env.MONGODB_URI;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const paymentCollection = client.db("EduMentor").collection("payments");

    // View Single Profile
    app.get("/payments", async (req, res) => {
      const result = await paymentCollection.find().toArray(); // Documentation: https://www.mongodb.com/docs/drivers/node/current/usage-examples/findOne/
      res.send(result);
    });
    
    app.post("/payment/success/:transactionID", async (req, res) => {
      const tranID = req.params.transactionID;
      // console.log("transactionID", tranID);
      
      const result = await paymentCollection.updateOne(
        { transactionID: tranID }, // Filter condition
        { $set: { payment_status: true } } // Update operation
      );

      // console.log(result);
      if(result.modifiedCount > 0) {
        res.redirect(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/student/my-payments/success/${tranID}`
        );
      }
    });
    
    app.post("/payment/fail/:transactionID", async (req, res) => {
      const tranID = req.params.transactionID;
      // console.log("transactionID", tranID);
      
      const result = await paymentCollection.deleteOne(
        { transactionID: tranID }, // Filter condition
      );

      // console.log(result);
      if(result.deletedCount) {
        res.redirect(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/student/my-payments/fail/${tranID}`
        );
      }
    });
    
    app.post("/payment/cancel/:transactionID", async (req, res) => {
      const tranID = req.params.transactionID;
      // console.log("transactionID", tranID);
      
      const result = await paymentCollection.deleteOne(
        { transactionID: tranID }, // Filter condition
      );

      // console.log(result);
      if(result.deletedCount) {
        res.redirect(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/student/my-payments/cancel/${tranID}`
        );
      }
    });

    // Send a ping to confirm a successful connection
    client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
    // client.connect();
  }
}
run().catch(console.dir);




app.get("/", (req, res) => {
  res.send("EduMentor is Running!");
});

app.listen(port, () => {
  console.log(`EduMentor Server is running on port ${port}`);
});