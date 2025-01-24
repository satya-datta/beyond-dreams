const router=require("express").Router();
const admincontroller=require("../controller/admincontroller")
const connection = require("../backend");
const jwt = require("jsonwebtoken");

// Secret key for JWT signing (use environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "AUTHENTICATED";



router.put('/updatecoursedetails/:course_id', (req, res) => {
    const { course_id } = req.params;
    const { course_name, course_description, instructor } = req.body;
   
    // Validate input
    if (!course_id) {
      return res.status(400).json({ message: "Course ID is required" });
    }
  
    if (!course_name || !course_description || !instructor) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    console.log("Updating course details");
  
    const query = `
      UPDATE course 
      SET course_name = ?, course_description = ?, instructor = ? 
      WHERE course_id = ?
    `;
  
    connection.query(
      query,
      [course_name, course_description, instructor, course_id],
      (err, result) => {
        if (err) {
          console.error("Error updating course:", err);
          return res.status(500).json({ message: "Internal Server Error", error: err });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Course not found" });
        }
  
        res.status(200).json({
          message: "Course updated successfully",
          updatedFields: { course_name, course_description, instructor },
        });
      }
    );
  });
router.post('/create-topic', admincontroller.createTopic);
router.delete('/delete-topic/:topic_id',(req, res) => {
    const { topic_id } = req.params;
  
    // Validate input
    if (!topic_id) {
      return res.status(400).json({ message: "Topic ID is required" });
    }
  
    console.log("Deleting topic");
  
    const query = "DELETE FROM topics WHERE topic_id = ?";
  
    connection.query(query, [topic_id], (err, result) => {
      if (err) {
        console.error("Error deleting topic:", err);
        return res.status(500).json({ message: "Internal Server Error", error: err });
      }
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Topic not found" });
      }
  
      res.status(200).json({
        message: "Topic deleted successfully",
        deletedTopicId: topic_id,
      });
    });
  });
router.post("/authadmin",admincontroller.authadmin);
router.get("/auth/validate",admincontroller.validateAdminCookie);
router.post('/create-course', admincontroller.createCourse);
router.get('/getallcourses', admincontroller.getAllCourses);
router.get('/gettopics/:course_id', admincontroller.getTopicsByCourseId);
router.get('/getspecific_course/:course_id', admincontroller.getCourseByCourseId);
router.delete('/delete-course/:course_id', (req, res) => {
  const { course_id } = req.params;

  // Validate input
  if (!course_id) {
      return res.status(400).json({ message: "Course ID is required" });
  }

  console.log("Deleting course");

  const query = "DELETE FROM course WHERE course_id = ?";

  connection.query(query, [course_id], (err, result) => {
      if (err) {
          console.error("Error deleting course:", err);
          return res.status(500).json({ message: "Internal Server Error", error: err });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Course not found" });
      }

      res.status(200).json({
          message: "Course deleted successfully",
          deletedCourseId: course_id,
      });
  });
});

module.exports=router;
