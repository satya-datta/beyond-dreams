const Userrouter=require("express").Router();
const Usercontroller=require("../controller/usercontroller");
const connection = require("../backend");
const multer = require('multer');

const path = require("path");

// Set up file storage for avatar images using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // specify the folder to store the uploaded files
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const filename = Date.now() + fileExtension; // Unique filename
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

Userrouter.post('/create-user', Usercontroller.createUser);
Userrouter.get('/getuser_details/:user_id', Usercontroller.getUserById);
Userrouter.put('/update_user/:user_id', (req, res, next) => {
    // Handle avatar upload
    upload.single('avatar')(req, res, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error uploading avatar image', error: err });
      }
  
      const userId = req.params.user_id; // Extract user ID from route params
      const { name, email, phone, gender, address, pincode } = req.body;
  
      const avatar = req.file ? req.file.filename : null; // Get the new avatar filename if provided
  
      // Validate required fields
      if (!userId || !name || !email || !phone || !gender || !address || !pincode) {
        return res.status(400).json({ message: 'All required fields must be provided' });
      }
  
      // Prepare query and data for updating user details
      const updateUserQuery = `
        UPDATE user
        SET 
          Name = ?, 
          Email = ?, 
          Phone = ?, 
          Gender = ?, 
          Address = ?, 
          Pincode = ?, 
          Avatar = COALESCE(?, Avatar)
        WHERE userid = ?
      `;
  
      const updateUserValues = [
        name,
        email,
        phone,
        gender,
        address,
        pincode,
        avatar,
        userId,
      ];
  
      // Execute the update query
      connection.query(updateUserQuery, updateUserValues, (err, result) => {
        if (err) {
          console.error('Error updating user details:', err);
          return res.status(500).json({ message: 'Error updating user details', error: err });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        res.status(200).json({ message: 'User details updated successfully' });
      });
    });
  }  );

module.exports=Userrouter;
