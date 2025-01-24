const connection = require("../backend");

exports.createPackage = (req, res, next) => {
  const { packageName, price, description } = req.body;

  // Validation checks
  if (!packageName || !price || !description) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Insert query for the package table with created_time
  const query = `
    INSERT INTO packages(package_name, package_price, description, created_time) 
    VALUES (?, ?, ?, NOW())
  `;

  // Execute the query
  connection.query(
    query,
    [packageName, price, description],
    (err, result) => {
      if (err) {
        console.error("Error creating package:", err);
        return res.status(500).json({
          message: "An error occurred while creating the package.",
          error: err,
        });
      }

      res.status(201).json({
        message: "Package created successfully.",
        package_id: result.insertId, // Returns the ID of the newly created package
      });
    }
  );
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






// Function to get packages with their associated courses
exports.getPackagesWithCourses = (req, res, next) => {
  const { page = 1, limit = 10, searchTerm = "" } = req.query;

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // SQL query with pagination and search term
  const query = `
    SELECT p.package_id, p.package_name, p.created_time, c.course_name 
    FROM packages p
    LEFT JOIN package_courses pc ON p.package_id = pc.package_id
    LEFT JOIN course c ON pc.course_id = c.course_id
    WHERE p.package_name LIKE ?
    ORDER BY p.created_time DESC
    LIMIT ? OFFSET ?
  `;

  // Execute query with search term and pagination parameters
  connection.query(query, [`%${searchTerm}%`, parseInt(limit), parseInt(offset)], (err, result) => {
    if (err) {
      console.error("Error fetching packages with courses:", err);
      return res.status(500).json({
        message: "An error occurred while fetching the packages.",
        error: err,
      });
    }

    // Count total number of matching packages for pagination
    const countQuery = `SELECT COUNT(*) AS total FROM packages WHERE package_name LIKE ?`;
    connection.query(countQuery, [`%${searchTerm}%`], (err, countResult) => {
      if (err) {
        console.error("Error counting packages:", err);
        return res.status(500).json({
          message: "An error occurred while counting the packages.",
          error: err,
        });
      }

      const totalPackages = countResult[0].total;
      const totalPages = Math.ceil(totalPackages / limit);

      // Reduce the result to organize packages with their associated courses
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
            courses: [row.course_name], // Initialize courses array
          });
        }
        return acc;
      }, []);

      res.status(200).json({
        packages: packagesWithCourses,
        totalPages: totalPages,
      });
    });
  });
};






// Function to get a single package with details and associated courses
exports.getPackageById = (req, res, next) => {
  const { packageId } = req.params;

  if (!packageId) {
    return res.status(400).json({ message: "Package ID is required." });
  }

  const packageQuery = `
    SELECT p.package_id, p.package_name, p.package_price, p.description, p.created_time, 
           c.course_id, c.course_name
    FROM packages p
    LEFT JOIN package_courses pc ON p.package_id = pc.package_id
    LEFT JOIN course c ON pc.course_id = c.course_id
    WHERE p.package_id = ?
  `;

  connection.query(packageQuery, [packageId], (err, results) => {
    if (err) {
      console.error("Error fetching package:", err);
      return res.status(500).json({
        message: "An error occurred while fetching the package details.",
        error: err,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Package not found." });
    }

    const packageDetails = results.reduce((acc, row) => {
      if (!acc) {
        acc = {
          package_id: row.package_id,
          package_name: row.package_name,
          package_price: row.package_price,
          description: row.description,
          created_time: row.created_time,
          courses: [],
        };
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