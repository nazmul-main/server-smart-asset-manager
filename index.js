// app.js
const express = require('express');
const cors = require('cors'); // Import the cors middleware
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SICRET_KEY);
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5001;
app.use(cors());
app.use(express.json())

// smart-asset-managment
// 2j7OAwG8JS12ApQ1


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    const Assets_admin_Cllection = client.db(AssetManagment).collection("user_admin");
    const Assets_Employe_Cllection = client.db(AssetManagment).collection("user_Employe");
    const AssetsCllection = client.db(AssetManagment).collection("my_assets");
    const Coustom_Assets_Cllection = client.db(AssetManagment).collection("coustom_request");



    /* -------------JWT Releted------------- */


    // // /*  jwt post api */
    // app.post('/api/v1/jwt', async (req, res) => {
    //   const user = req.body;
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    //     expiresIn: '1h'
    //   })
    //   res.send({ token });
    // })

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



    /*  jwt post api */
    app.post('/api/v1/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
      })
      res.send({ token });
    })










    /* -------------Payment Releted------------- */


    /* payment intent post */
    app.post("api/v1/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      })
      res.send({
        clientSecret: paymentIntent.client_secret
      });
    })



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
      const result = await cursor.toArray()
      res.send(result);
    });

    // asset single  get api 
    app.get('/api/v1/assets/update-assets/:id', async (req, res) => {
      const id = req.params.id;
      console.log("id", id);
      const query = { _id: new ObjectId(id) }
      const result = await AssetsCllection.findOne(query)
      res.send(result);
    });

    // update data
    app.put('/api/v1/assets/update-assets-done/:id', async (req, res) => {
      const id = req.params.id;
      const update = req.body
      console.log(id, update);
      const filter = { _id: new ObjectId(id) }
      const option = { upsert: true }
      const updatedBlog = {
        $set: {
          name: update.name,
          image: update.image,
          quantity: update.quantity,
          type: update.type
        }
      }



      const result = await AssetsCllection.updateOne(filter, updatedBlog, option);
      res.send(result);
      console.log(result);
    })


    /* list delete  Delete */
    app.delete('/api/v1/assets/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await AssetsCllection.deleteOne(query);
      res.send(result)
    });

   

    app.patch('/api/v1/users-admin/:email', async(req,res)=>{
      const email = req.params.email;
      console.log(email);
      const filter = {email: email}
      const updatedDoc = {
        $set:{
          role: "admin"
        }
      }
      const result = await Assets_Employe_Cllection.updateOne(filter, updatedDoc)
      res.send(result)
    })




    /* -------------Employe Releted------------- */

    app.post('/api/v1/users-employee', async (req, res) => {
      const user = req.body
      const query = { email: user.email, }
      const exitingUser = await Assets_Employe_Cllection.findOne(query)
      if (exitingUser) {
        return res.send({ messege: "user already exists", insertedId: null })
      }
      const result = await Assets_Employe_Cllection.insertOne(user);
      res.send(result);
    })

    /*  all user */
    app.get('/api/v1/all-users', async (req, res) => {
      const cursor = Assets_Employe_Cllection.find()
      const result = await cursor.toArray()
      res.send(result);
    });

    // coustom-asset post  api 
    app.post('/api/v1/coustom-assets/:id', async (req, res) => {
      const blog = req.body;
      const result = await Coustom_Assets_Cllection.insertOne(blog);
      console.log(result);
      res.send(result);
    });

    /* Coustom-asset get api */
    app.get('/api/v1/coustom-assets', async (req, res) => {
      const cursor = Coustom_Assets_Cllection.find()
      const result = await cursor.toArray()
      res.send(result);
    });



    // update data
    app.put('/api/v1/coustom-assets/:id', async (req, res) => {
      const id = req.params.id;
      const update = req.body
      console.log(id, update);
      const filter = { _id: new ObjectId(id) }
      const option = { upsert: true }
      const updatedBlog = {
        $set: {
          assetName: update.assetName,
          assetType: update.assetType,
          price: update.price,
          additionalInfo: update.additionalInfo,
          assetImage: update.assetImage,
        }
      }
      const result = await Coustom_Assets_Cllection.updateOne(filter, updatedBlog, option);
      res.send(result);
      console.log(result);
    })







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