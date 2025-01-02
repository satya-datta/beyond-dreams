const express = require('express');
var connection=require("./backend");
const adminRouter=require("./routers/adminrouter")
const port =  5000;
const app = express();
const cors = require('cors');


// Allow CORS for specific origin
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers (including Authorization for JWT)
}));
app.use(express.json());
 app.use('/', adminRouter);


app.listen(port,'0.0.0.0', () => {
  console.log(`API working on port ${port}`);
  connection.connect(function (err) {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    console.log('Connected to MySQL successfully!');
  });
  
});
