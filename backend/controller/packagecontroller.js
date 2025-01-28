const connection = require("../backend");

// controller/packageController.js
const path = require('path');
const { deleteFile } = require("../utils/fileUtils");


// Helper function to delete old files safely
const safelyDeleteFile = (filePath) => {
  try {
    deleteFile(filePath);
  } catch (err) {
    console.error('Error deleting file:', err.message);
  }
};


// Create Package with image upload
exports.createPackage = (req, res, next) => {
  const { packageName, price, description,commission } = req.body;
  const imageFile = req.file;  // This contains the uploaded file information

  if (!imageFile) {
    return res.status(400).json({ message: "Image is required." });
  }

  // Validation checks
  if (!packageName || !price || !description || !imageFile || !commission) {
    return res.status(400).json({ message: "All fields, including the image, are required." });
  }

  // Store image path in the database
  const imagePath = `/uploads/${imageFile.filename}`; // Path to the image file

  // Insert query for the package table including image
  const query = `
    INSERT INTO packages (package_name, package_price, description, image_path, created_time, commission)
    VALUES (?, ?, ?, ?, NOW(),?)
  `;

  // Execute query
  connection.query(
    query,
    [packageName, price, description, imagePath,commission],  // Include the image path
    (err, result) => {
      if (err) {
        console.error("Error creating package:", err);
        return res.status(500).json({ message: "An error occurred while creating the package.", error: err });
      }

      res.status(201).json({
        message: "Package created successfully.",
        package_id: result.insertId, // The ID of the newly created package
        imageUrl: imagePath,  // Image URL for confirmation
      });
    }
  );
};





// Update Package with Image Upload
exports.updatePackageById = (req, res) => {
  const { package_id } = req.params;
  const { packageName, price, description, commission } = req.body;
  const imageFile = req.file;

  // Validate input
  if (!packageName || !price || !description || !commission) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Check existing package
  const selectQuery = 'SELECT image_path FROM packages WHERE package_id = ?';
  connection.query(selectQuery, [package_id], (err, result) => {
    if (err) {
      console.error('Error fetching package:', err);
      return res.status(500).json({ message: 'Failed to fetch package.', error: err });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Package not found.' });
    }

    const oldImagePath = result[0].image_path;
    let imagePath = oldImagePath;

    if (imageFile) {
      const newImagePath = `/uploads/${imageFile.filename}`;
      safelyDeleteFile(path.join(__dirname, '..', '..', 'uploads', path.basename(oldImagePath))); // Delete old file
      imagePath = newImagePath;
    }

    const updateQuery = `
      UPDATE packages
      SET package_name = ?, package_price = ?, description = ?, commission = ?, image_path = ?, updated_time = NOW()
      WHERE package_id = ?
    `;

    connection.query(
      updateQuery,
      [packageName, price, description, commission, imagePath, package_id],
      (err, result) => {
        if (err) {
          console.error('Error updating package:', err);
          return res.status(500).json({ message: 'Failed to update package.', error: err });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Package not found.' });
        }

        res.status(200).json({
          message: 'Package updated successfully.',
          imageUrl: imagePath,
        });
      }
    );
  });
};




// Controller method to delete a package and its related courses
exports.deletePackageAndCourses = async (req, res) => {
  const { package_id } = req.params;

  try {
    // Begin a transaction
    await connection.query('START TRANSACTION');

    // Delete related entries from package_courses table
    await connection.query('DELETE FROM package_courses WHERE package_id = ?', [package_id]);

    // Delete the package itself from the packages table
    await connection.query('DELETE FROM packages WHERE package_id = ?', [package_id]);

    // Commit the transaction
    await connection.query('COMMIT');

    res.status(200).json({ message: 'Package and related courses deleted successfully.' });
  } catch (error) {
    // Rollback transaction on error
    await connection.query('ROLLBACK');
    console.error('Error deleting package:', error);
    res.status(500).json({ error: 'An error occurred while deleting the package.' });
  }
};




// Function to get packages with their associated courses, including pagination info
exports.getPackagesWithCourses = (req, res, next) => {
  const { page = 1, limit = 5, searchTerm = "" } = req.query;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // SQL query to get the total number of packages that match the search term (for pagination)
  const countQuery = `
    SELECT COUNT(DISTINCT p.package_id) AS totalPackages
    FROM packages p
    LEFT JOIN package_courses pc ON p.package_id = pc.package_id
    LEFT JOIN course c ON pc.course_id = c.course_id
    WHERE p.package_name LIKE ?;
  `;

  // SQL query to get the packages with courses, applying pagination
  const query = `
    SELECT p.package_id, p.package_name, p.created_time, p.image_path, p.commission, c.course_name
    FROM packages p
    LEFT JOIN package_courses pc ON p.package_id = pc.package_id
    LEFT JOIN course c ON pc.course_id = c.course_id
    WHERE p.package_name LIKE ? 
    ORDER BY p.created_time DESC 
    LIMIT ? OFFSET ?;
  `;

  // Execute the query to get the total number of matching packages
  connection.query(countQuery, [`%${searchTerm}%`], (err, countResult) => {
    if (err) {
      console.error("Error fetching total packages count:", err);
      return res.status(500).json({
        message: "An error occurred while fetching the total number of packages.",
        error: err,
      });
    }

    // Calculate the total number of pages
    const totalPackages = countResult[0].totalPackages;
    const totalPages = Math.ceil(totalPackages / limit); // Round up the division result

    // Now, execute the query to fetch the paginated packages and their courses
    connection.query(query, [`%${searchTerm}%`, parseInt(limit), parseInt(offset)], (err, result) => {
      if (err) {
        console.error("Error fetching packages with courses:", err);
        return res.status(500).json({
          message: "An error occurred while fetching the packages.",
          error: err,
        });
      }

      // Combine the rows into the appropriate structure
      const packagesWithCourses = result.reduce((acc, row) => {
        const existingPackage = acc.find(pkg => pkg.package_id === row.package_id);

        if (existingPackage) {
          // Ensure the 'courses' array is always initialized
          if (!existingPackage.courses) {
            existingPackage.courses = [];
          }
          existingPackage.courses.push(row.course_name);
        } else {
          acc.push({
            package_id: row.package_id,
            package_name: row.package_name,
            created_time: row.created_time,
            image_path: row.image_path,
            courses: row.course_name ? [row.course_name] : [], // Handle empty courses
          });
        }

        return acc;
      }, []);

      // Respond with paginated results, including total pages
      res.status(200).json({
        packages: packagesWithCourses,
        totalPages: totalPages,
        currentPage: page,
      });
    });
  });
};









//Remove courses that are mapped

exports.deleteCoursesFromPackage = (req, res, next) => {
  const { package_id } = req.params; // Get package ID from URL params
  const { courses } = req.body; // Get the array of course IDs from the request body

  if (!courses || courses.length === 0) {
    return res.status(400).json({ message: "No courses selected for deletion." });
  }

  // Validate the existence of the package
  const checkPackageQuery = `SELECT * FROM packages WHERE package_id = ?`;
  connection.query(checkPackageQuery, [package_id], (err, result) => {
    if (err) {
      console.error("Error checking package:", err);
      return res.status(500).json({
        message: "An error occurred while checking the package.",
        error: err,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Package not found." });
    }

    // Validate that the courses exist in the package_courses table
    const checkCoursesQuery = `SELECT * FROM package_courses WHERE package_id = ? AND course_id IN (?)`;
    connection.query(checkCoursesQuery, [package_id, courses], (err, result) => {
      if (err) {
        console.error("Error checking courses:", err);
        return res.status(500).json({
          message: "An error occurred while checking the courses.",
          error: err,
        });
      }

      // If no matching course entries are found in the package_courses table, return an error
      if (result.length === 0) {
        return res.status(404).json({ message: "No matching courses found in the package." });
      }

      // Proceed to remove the selected courses from the package_courses table
      const deleteCoursesQuery = `DELETE FROM package_courses WHERE package_id = ? AND course_id IN (?)`;
      connection.query(deleteCoursesQuery, [package_id, courses], (err, result) => {
        if (err) {
          console.error("Error deleting courses:", err);
          return res.status(500).json({
            message: "An error occurred while deleting the courses.",
            error: err,
          });
        }

        res.status(200).json({
          message: "Selected courses removed from the package successfully.",
        });
      });
    });
  });
};






// Function to map selected courses to the package
exports.mapCoursesToPackage = (req, res, next) => {
  const { packageId, courses } = req.body;

  // Validation checks
  if (!packageId || !courses || courses.length === 0) {
    return res.status(400).json({ message: "Package ID and selected courses are required." });
  }

  // Check if the package exists
  const checkPackageQuery = `SELECT * FROM packages WHERE package_id = ?`;
  connection.query(checkPackageQuery, [packageId], (err, result) => {
    if (err) {
      console.error("Error checking package:", err);
      return res.status(500).json({
        message: "An error occurred while checking the package.",
        error: err,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Package not found." });
    }

    // Now check if all courses exist in the courses table
    const checkCoursesQuery = `SELECT * FROM course WHERE course_id IN (?)`;
    connection.query(checkCoursesQuery, [courses], (err, result) => {
      if (err) {
        console.error("Error checking courses:", err);
        return res.status(500).json({
          message: "An error occurred while checking the courses.",
          error: err,
        });
      }

      if (result.length !== courses.length) {
        return res.status(404).json({ message: "One or more courses not found." });
      }

      // Now insert the courses into the package_courses table
      const mapCoursesQuery = `
        INSERT INTO package_courses (package_id, course_id)
        VALUES ?
      `;

      // Prepare the course values to be inserted
      const courseValues = courses.map(courseId => [packageId, courseId]);

      connection.query(mapCoursesQuery, [courseValues], (err, result) => {
        if (err) {
          console.error("Error mapping courses:", err);
          return res.status(500).json({
            message: "An error occurred while mapping courses.",
            error: err,
          });
        }

        res.status(200).json({
          message: "Courses successfully mapped to the package.",
        });
      });
    });
  });
};







// Function to map selected courses to a package (add courses)
exports.addCoursesToPackage = (req, res, next) => {
  const { packageId, courses } = req.body;

  // Validation checks
  if (!packageId || !courses || courses.length === 0) {
    return res.status(400).json({ message: "Package ID and selected courses are required." });
  }

  // Check if the package exists
  const checkPackageQuery = `SELECT * FROM packages WHERE package_id = ?`;
  connection.query(checkPackageQuery, [packageId], (err, result) => {
    if (err) {
      console.error("Error checking package:", err);
      return res.status(500).json({
        message: "An error occurred while checking the package.",
        error: err,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Package not found." });
    }

    // Now check if all courses exist in the courses table
    const checkCoursesQuery = `SELECT * FROM course WHERE course_id IN (?)`;
    connection.query(checkCoursesQuery, [courses], (err, result) => {
      if (err) {
        console.error("Error checking courses:", err);
        return res.status(500).json({
          message: "An error occurred while checking the courses.",
          error: err,
        });
      }

      if (result.length !== courses.length) {
        return res.status(404).json({ message: "One or more courses not found." });
      }

      // Now insert the courses into the package_courses table
      const mapCoursesQuery = `
        INSERT INTO package_courses (package_id, course_id)
        VALUES ?
      `;

      // Prepare the course values to be inserted
      const courseValues = courses.map(courseId => [packageId, courseId]);

      connection.query(mapCoursesQuery, [courseValues], (err, result) => {
        if (err) {
          console.error("Error adding courses:", err);
          return res.status(500).json({
            message: "An error occurred while adding courses.",
            error: err,
          });
        }

        res.status(200).json({
          message: "Courses successfully added to the package.",
        });
      });
    });
  });
};



// Fetching a single package by ID with associated courses
exports.getPackageById = (req, res, next) => {
  const { package_id } = req.params; // Get packageId from URL
  console.log('Received packageId:', package_id); 

  if (!package_id) {
    return res.status(400).json({ message: "Package ID is missing!" });
  }

  const packageQuery = `
    SELECT p.package_id, p.package_name, p.package_price, p.description, p.created_time, p.commission, p.image_path,
           c.course_id, c.course_name
    FROM packages p
    LEFT JOIN package_courses pc ON p.package_id = pc.package_id
    LEFT JOIN course c ON pc.course_id = c.course_id
    WHERE p.package_id = ?;
  `;

  connection.query(packageQuery, [package_id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "An error occurred while fetching the package details.",
        error: err,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Package not found." });
    }


  // Base URL for images (replace with your actual server URL or CDN)
  const baseImageUrl = "http://localhost:5000/uploads"; // Example: Replace with your actual URL





    // Organize package details and associated courses
    const packageDetails = results.reduce((acc, row) => {
      if (!acc) {
        acc = {
          package_id: row.package_id,
          package_name: row.package_name,
          package_price: row.package_price,
          description: row.description,
          commission: row.commission,
          image_path: row.image_path ? `${baseImageUrl}/${row.image_path}` : null, // Full URL to image
          created_time: row.created_time,
          courses: [],
        };
         // Log the image path to ensure it's correct
    console.log("Image Path:", acc.image_path);
      }

      if (row.course_id) {
        acc.courses.push({
          course_id: row.course_id,
          course_name: row.course_name,
        });
      }

      return acc;
    }, null);

    res.status(200).json(packageDetails);
  });
};



exports.getAllCourses = (req, res, next) => {
  const query = "SELECT course_id, course_name FROM course";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching courses:", err);
      return res.status(500).json({
        message: "An error occurred while fetching the courses.",
        error: err,
      });
    }

    res.status(200).json(results); // Send back the list of courses
  });
};