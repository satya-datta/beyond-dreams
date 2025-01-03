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


// // Create Topic
// exports.createTopic = (req, res, next) => {
//   const { topic_name, video_url, course_id } = req.body;

//   // Validation checks (optional)
//   if (!topic_name || !video_url || !course_id) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   // Corrected query with quotes
//   const query = "INSERT INTO topics (topic_name, video_url, course_id) VALUES (?, ?, ?)";
  
//   connection.query(query, [topic_name, video_url, course_id], (err, result) => {
//     if (err) {
//       console.error("Error creating topic:", err);
//       return res.status(500).json({
//         message: "An error occurred while creating the topic",
//         error: err,
//       });
//     }

//     res.status(201).json({
//       message: "Topic created successfully",
//       topic_id: result.insertId, // Returns the ID of the newly created topic
//     });
//   });
// };
//  exports.getAllCourses = (req, res) => {
//   const query = "SELECT * FROM course";
  
//   connection.query(query, (err, results) => {
//     if (err) {
//       console.error("Error fetching courses:", err);
//       return res.status(500).json({ message: "Internal Server Error", error: err });
//     }
 
//     res.status(200).json({ message: "Courses fetched successfully", courses: results });
//   });
// };

// exports.getTopicsByCourseId = (req, res) => {
//   const { course_id } = req.params;
 
//   // Validate input
//   if (!course_id) {
//     return res.status(400).json({ message: "Course ID is required" });
//   }

//   const query = "SELECT * FROM topics WHERE course_id = ?";
//   console.log("get topics");
//   connection.query(query, [course_id], (err, results) => {
//     if (err) {
//       console.error("Error fetching topics:", err);
//       return res.status(500).json({ message: "Internal Server Error", error: err });
//     }

//     res.status(200).json({ message: "Topics fetched successfully", topics: results });
//   });
// };

// exports.getCourseByCourseId = (req, res) => {
//   const { course_id } = req.params;

//   // Validate input
//   if (!course_id) {
//     return res.status(400).json({ message: "Course ID is required" });
//   }
  
//   console.log("Fetching course details");

//   const query = "SELECT * FROM course WHERE course_id = ?";
  
//   connection.query(query, [course_id], (err, results) => {
//     if (err) {
//       console.error("Error fetching course:", err);
//       return res.status(500).json({ message: "Internal Server Error", error: err });
//     }

//     if (results.length === 0) {
//       return res.status(404).json({ message: "Course not found" });
//     }

//     // Extracting the course details
//     const courseDetails = results[0]; // Assuming `course_id` is unique
//     const { course_name, course_description, instructor } = courseDetails;

//     res.status(200).json({
//       message: "Course fetched successfully",
//       course: {
//         id: course_id,
//         name: course_name,
//         description: course_description,
//         instructor: instructor,
//       },
//     });
//   });
// };
// const updateCourseDetails = (req, res) => {
//   const { courseid } = req.params;
//   const { course_name, course_description, instructor } = req.body;

//   // Validate input
//   if (!courseid) {
//     return res.status(400).json({ message: "Course ID is required" });
//   }

//   if (!course_name || !course_description || !instructor) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   console.log("Updating course details");

//   const query = `
//     UPDATE course 
//     SET course_name = ?, course_description = ?, instructor = ? 
//     WHERE course_id = ?
//   `;

//   connection.query(
//     query,
//     [course_name, course_description, instructor, courseid],
//     (err, result) => {
//       if (err) {
//         console.error("Error updating course:", err);
//         return res.status(500).json({ message: "Internal Server Error", error: err });
//       }

//       if (result.affectedRows === 0) {
//         return res.status(404).json({ message: "Course not found" });
//       }

//       res.status(200).json({
//         message: "Course updated successfully",
//         updatedFields: { course_name, course_description, instructor },
//       });
//     }
//   );
// };

// const deleteTopicById = (req, res) => {
//   const { topic_id } = req.params;

//   // Validate input
//   if (!topic_id) {
//     return res.status(400).json({ message: "Topic ID is required" });
//   }

//   console.log("Deleting topic");

//   const query = "DELETE FROM topics WHERE topic_id = ?";

//   connection.query(query, [topic_id], (err, result) => {
//     if (err) {
//       console.error("Error deleting topic:", err);
//       return res.status(500).json({ message: "Internal Server Error", error: err });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Topic not found" });
//     }

//     res.status(200).json({
//       message: "Topic deleted successfully",
//       deletedTopicId: topic_id,
//     });
//   });
// };

// // Export functions using module.exports
// module.exports = {
//   updateCourseDetails,
//   deleteTopicById,
// };
