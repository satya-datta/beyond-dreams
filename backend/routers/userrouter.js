const Userrouter=require("express").Router();
const Usercontroller=require("../controller/usercontroller");
const connection = require("../backend");

Userrouter.post('/create-user', (req, res, next) => {
    const {
      name,
      packageId,
      email,
      phone,
      gender,
      avatar,
      sponsorName,
      sponsorEmail,
      generatedReferralCode,
      referrerId,
    } = req.body;
  
    // Validation checks
    if (!name || !email || !phone || !gender) {
      return res.status(400).json({ message: "Name, Email, Phone, and Gender are required fields." });
    }
  
    // Insert query for the users table with created_time
    const query = `
      INSERT INTO User (
        Name, PackageId, Email, Phone, Gender, Avatar, SponsorName, SponsorEmail, GeneratedReferralCode, ReferrerId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    // Execute the query
    connection.query(
      query,
      [
        name,
        packageId || null, // Use null if no packageId is provided
        email,
        phone,
        gender,
        avatar || null, // Use null if no avatar is provided
        sponsorName || null, // Use null if no sponsorName is provided
        sponsorEmail || null, // Use null if no sponsorEmail is provided
        generatedReferralCode || null, // Use null if no referral code is provided
        referrerId || null, // Use null if no referrerId is provided
      ],
      (err, result) => {
        if (err) {
          console.error("Error creating user:", err);
          return res.status(500).json({
            message: "An error occurred while creating the user.",
            error: err,
          });
        }
  
        res.status(201).json({
          message: "User created successfully.",
          user_id: result.insertId, // Returns the ID of the newly created user
        });
      }
    );
  });
module.exports=Userrouter;
