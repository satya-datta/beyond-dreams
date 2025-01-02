const connection = require("../backend");
const jwt = require("jsonwebtoken");

// Secret key for JWT signing (store this securely in your environment variables)
const JWT_SECRET = "AUTHENTICATED";

// Authenticate Admin
exports.authadmin = (req, res, next) => {
  const { email, password } = req.body;
  console.log("enter authentication");

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Query the database to check admin credentials
  connection.query(
    "SELECT * FROM admin_details WHERE email = ? AND password = ?",
    [email, password],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      // If admin found
      if (results.length > 0) {
        console.log("successful");
        const admin = results[0];

        // Generate a JWT token
        const token = jwt.sign(
          { id: admin.id, email: admin.email }, // Payload
          JWT_SECRET, // Secret key
          { expiresIn: "2h" } // Token expiry
        );

        // Send token and admin details in response
        return res.status(200).json({
          message: "Authentication successful",
          token,
          admin: { id: admin.id, email: admin.email, name: admin.name },
        });
      } else {
        console.log("unsuccessful");
        // If admin not found
        return res.status(401).json({ message: "Unknown admin" });
      }
    }
  );
};
// Create Course
exports.createCourse = (req, res, next) => {
  const { course_name, created_time, course_description, instructor } = req.body;

  // Validation checks (optional)
  if (!course_name || !created_time || !course_description || !instructor) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Corrected query with quotes
  const query = "INSERT INTO course (course_name, created_time, course_description, instructor) VALUES (?, ?, ?, ?)";
  
  connection.query(
    query,
    [course_name, created_time, course_description, instructor],
    (err, result) => {
      if (err) {
        console.error("Error creating course:", err);
        return res.status(500).json({
          message: "An error occurred while creating the course",
          error: err,
        });
      }

      res.status(201).json({
        message: "Course created successfully",
        course_id: result.insertId, // Returns the ID of the newly created course
      });
    }
  );
};

// Create Topic
exports.createTopic = (req, res, next) => {
  const { topic_name, video_url, course_id } = req.body;

  // Validation checks (optional)
  if (!topic_name || !video_url || !course_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Corrected query with quotes
  const query = "INSERT INTO topics (topic_name, video_url, course_id) VALUES (?, ?, ?)";
  
  connection.query(query, [topic_name, video_url, course_id], (err, result) => {
    if (err) {
      console.error("Error creating topic:", err);
      return res.status(500).json({
        message: "An error occurred while creating the topic",
        error: err,
      });
    }

    res.status(201).json({
      message: "Topic created successfully",
      topic_id: result.insertId, // Returns the ID of the newly created topic
    });
  });
};
 exports.getAllCourses = (req, res) => {
  const query = "SELECT * FROM course";
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching courses:", err);
      return res.status(500).json({ message: "Internal Server Error", error: err });
    }
 
    res.status(200).json({ message: "Courses fetched successfully", courses: results });
  });
};

exports.getTopicsByCourseId = (req, res) => {
  const { course_id } = req.params;
 
  // Validate input
  if (!course_id) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  const query = "SELECT * FROM topics WHERE course_id = ?";
  console.log("get topics");
  connection.query(query, [course_id], (err, results) => {
    if (err) {
      console.error("Error fetching topics:", err);
      return res.status(500).json({ message: "Internal Server Error", error: err });
    }

    res.status(200).json({ message: "Topics fetched successfully", topics: results });
  });
};
exports.getCourseByCourseId = (req, res) => {
  const { course_id } = req.params;

  // Validate input
  if (!course_id) {
    return res.status(400).json({ message: "Course ID is required" });
  }
  
  console.log("Fetching course details");

  const query = "SELECT * FROM course WHERE course_id = ?";
  
  connection.query(query, [course_id], (err, results) => {
    if (err) {
      console.error("Error fetching course:", err);
      return res.status(500).json({ message: "Internal Server Error", error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Extracting the course details
    const courseDetails = results[0]; // Assuming `course_id` is unique
    const { course_name, course_description, instructor } = courseDetails;

    res.status(200).json({
      message: "Course fetched successfully",
      course: {
        id: course_id,
        name: course_name,
        description: course_description,
        instructor: instructor,
      },
    });
  });
};
