// routes/packageRouter.js
const express = require("express");

const packageController = require("../controller/packagecontroller");
const validatePackage = require("../middlewares/validatePackage");
const upload = require('../middlewares/upload');  // Multer upload instance
const Packagerouter = express.Router();
 
// Route to create package
Packagerouter.post('/create-package', upload.single('image'), validatePackage,packageController.createPackage);

// Route for mapping courses to a package
Packagerouter.post('/course-mapping', packageController.mapCoursesToPackage);


// Route to get packages with courses
// Define the route for fetching packages with courses
Packagerouter.get("/packages-with-courses", packageController.getPackagesWithCourses);

// Route to fetch a single package by ID
Packagerouter.get("/edit_package/:package_id", packageController.getPackageById);


// Route to update a package by ID
//Packagerouter.put("/edit_package/:package_id", packageController.updatePackageById);
// Update package with image
Packagerouter.put('/edit_package/:package_id', upload.single('image'), validatePackage, packageController.updatePackageById);




// Route to delete a package and its related courses
Packagerouter.delete('/delete-package/:package_id', packageController.deletePackageAndCourses);



// // Route to update a package by ID (PUT method)
// Packagerouter.put("/edit_package/:package_id", upload.single('image'), packageController.updatePackageById);


// Route to delete selected courses from a package
Packagerouter.delete('/remove_courses/:package_id', packageController.deleteCoursesFromPackage);


// Route for adding courses to a package

Packagerouter.post('/add_courses', packageController.addCoursesToPackage);




// Route to get all available courses
Packagerouter.get("/courses", packageController.getAllCourses);


module.exports = Packagerouter;
