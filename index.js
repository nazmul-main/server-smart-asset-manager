// app.js
const express = require('express');
const cors = require('cors'); // Import the cors middleware
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5007;
app.use(cors());
app.use(express.json())

// smart-asset-managment
// 2j7OAwG8JS12ApQ1


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.idkvt6k.mongodb.net/?retryWrites=true&w=majority`;

const AssetManagment = "smart_asset_managment";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const AssetsCllection = client.db(AssetManagment).collection("my_assets");


    // /*  jwt post api */
    app.post('/api/v1/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
      })
      res.send({ token });
    })

    // middleware 
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access 1' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access 2' })
        }
        req.decoded = decoded;
        console.log(decoded, '1');
        next();
      })
    }



     

    /* -------------Admin Releted------------- */

    // asset post  api 
    app.post('/api/v1/assets', async (req, res) => {
      const blog = req.body;
      const result = await AssetsCllection.insertOne(blog);
      console.log(result);
      res.send(result);
    });

    // asset get api 
    app.get('/api/v1/assets', async (req, res) => {
      const cursor = AssetsCllection.find()
      const result = await  cursor.toArray()
      res.send(result);
    });


    



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



// Define a route
app.get('/', (req, res) => {
  res.send('Smart asset manement server is running...!');
});




// Start the server
app.listen(port, () => {
  console.log(`Smart asset manement server is running ${port}`);
});





/* 
  lotify 
  undrop
*/