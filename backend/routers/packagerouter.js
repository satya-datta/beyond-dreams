// const Packagerouter=require("express").Router();
// const packagecontroller=require("../controller/packagecontroller");
// const connection = require("../backend");
// Packagerouter.post('/create-package', packagecontroller.createPackage);
// module.exports=Packagerouter;




// routes/packageRouter.js
const express = require("express");
const packageController = require("../controller/packagecontroller");
const upload = require('../middlewares/upload');  // Multer upload instance
const Packagerouter = express.Router();

// Route to create package
Packagerouter.post('/create-package', upload.single('image'), packageController.createPackage);

// Route for mapping courses to a package
Packagerouter.post('/course-mapping', packageController.mapCoursesToPackage);


// Route to get packages with courses
// Define the route for fetching packages with courses
Packagerouter.get("/packages-with-courses", packageController.getPackagesWithCourses);

// Route to fetch a single package by ID
Packagerouter.get("/package/:packageId", packageController.getPackageById);


// Route to get all available courses
Packagerouter.get("/courses", packageController.getAllCourses);


module.exports = Packagerouter;
