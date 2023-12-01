// app.js
const express = require('express');
const cors = require('cors'); // Import the cors middleware
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SICRET_KEY);
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5001;
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://server-smart-asset-manager.vercel.app/'

    ],

  }),
)
app.use(express.json())




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

    const Assets_Employe_Cllection = client.db(AssetManagment).collection("user_Employe");
    const AssetsCllection = client.db(AssetManagment).collection("my_assets");
    const Coustom_Assets_Cllection = client.db(AssetManagment).collection("coustom_request");
    const Team_Cllection = client.db(AssetManagment).collection("my_team");



    /* -------------JWT Releted------------- */


    /*  jwt post api */
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






    /* varty token */

    // const verifyToken = (req, res, next) => {
    //   console.log("inside veryfytoken", req.headers);

    //   if (!req.headers.authorization) {
    //     return res.status(401).send({ messege: 'forbidden access denied' });
    //     const token = req.headers.authorization.split(' ')[1];
    //     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    //       if (err) {
    //         return res.status(401).send({ message: 'unauthorized access 2' })
    //       }
    //       req.decoded = decoded;
    //       console.log(decoded, '1');
    //       next();
    //     })

    //   }






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

    // /* verify admin */
    // const veryAdmin = async (req, res, next) => {
    //   const email = req.decoded.email;
    //   console.log(email);
    //   const query = { email: email };
    //   const user = await Assets_Employe_Cllection.findOne(query);
    //   const isAdmin = user?.role == 'admin'
    //   if (!isAdmin) {
    //     return res.status(403).send({ message: 'forbidden access' });
    //   }
    //   next();
    // }

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

    app.get('/api/v1/assets-filter', async (req, res) => {
      const email = req.query.yourAdmin;
      const query = { adminEmail: email };
      const result = await AssetsCllection.find(query).toArray();
      res.send(result)
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



    app.patch('/api/v1/users-admin/:email', async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const filter = { email: email }
      const updatedDoc = {
        $set: {
          role: "admin"
        }
      }
      const result = await Assets_Employe_Cllection.updateOne(filter, updatedDoc)
      res.send(result)
    })



    /* My tem relaterd */
    app.post('/api/v1/add-team', async (req, res) => {
      const team = req.body;
      const { userId } = team;
      const query = { _id: new ObjectId(userId) };
      const result = await Team_Cllection.insertOne(team);
      const updateduser = {
        $set: {
          role: "employee"
        }
      }
      await Assets_Employe_Cllection.updateOne(query, updateduser)
      res.send(result);
    });

    /* Team Mebber Delete to collection*/
    app.delete('/api/v1/add-team-delete/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await Team_Cllection.deleteOne(query);
      const updateduser = {
        $set: {
          role: "employee"
        }
      }
      await Assets_Employe_Cllection.updateOne(query, updateduser)
      res.send(result);
    });


    // asset get api 
    app.get('/api/v1/all-add-team', async (req, res) => {
      const cursor = Team_Cllection.find()
      const result = await cursor.toArray()
      res.send(result);
    });


    /* flter tem member */

    app.get('/api/v1/add-team', async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { adminEmail: email };
      const result = await Team_Cllection.find(query).toArray();
      res.send(result)
    });

    /* find */
    app.get('/api/v1/add-team-one', async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email };
      const result = await Team_Cllection.findOne(query);
      res.send(result)
    });







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

    /*  single user */
    app.get('/api/v1/all-users-single', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await Assets_Employe_Cllection.findOne(query);
      res.send(result)
    });

    /* find users */
    app.get('/api/v1/all-users-find', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await Assets_Employe_Cllection.find(query);
      res.send(result)
    });


    app.get('/api/v1/users-admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email
      console.log(email);
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'unathorized 2' })
      };
      const query = { email: email };
      const user = await Assets_Employe_Cllection.findOne(query)
      let admin = false;
      if (user) {
        admin = user?.role === 'admin'
      }
      res.send({ admin })

      /* employe role change */




    })

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

    /* Update Profile */
    app.put('/api/v1/all-users-update/:id', async (req, res) => {
      const id = req.params.id;
      const update = req.body
      console.log(id, update);
      const filter = { _id: new ObjectId(id) }
      const option = { upsert: true }
      const updatedBlog = {
        $set: {

          adminname: update.adminname,
          bithdayDate: update.bithdayDate,
          email: update.email
        }
      }
      const result = await Assets_Employe_Cllection.updateOne(filter, updatedBlog, option);
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







