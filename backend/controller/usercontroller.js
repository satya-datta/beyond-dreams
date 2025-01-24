const multer = require('multer');
const connection = require("../backend");
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

// Function to calculate referral commission
const returnCommissionMethod = (userPackageId, referrerPackageId, callback) => {
  const packageQuery = `
    SELECT package_id, package_price FROM packages WHERE package_id IN (?, ?)
  `;
  connection.query(packageQuery, [userPackageId, referrerPackageId], (err, results) => {
    if (err) {
      console.error("Error fetching package details:", err);
      return callback(err, null);
    }

    if (results.length < 1) {
      console.error("One or both packages not found.");
      return callback(new Error("One or both packages not found."), null);
    }

    // Initialize variables to store commissions
    let userCommission = null;
    let referrerCommission = null;

    // Calculate commissions directly
    results.forEach(pkg => {
       const commission = Math.floor(pkg.package_price - pkg.package_price * 0.2); // Commission = price - 20%, rounded down
       
      console.log(userPackageId,"-",referrerPackageId);
    

      if (pkg.package_id == userPackageId) {
        userCommission = commission;
        console.log(pkg.package_price);
        console.log(userCommission)
      } else if (pkg.package_id == referrerPackageId){

        referrerCommission = commission;
        console.log(pkg.package_price);
        console.log(referrerCommission)
      }

      if (referrerPackageId==pkg.package_id && pkg.package_id == userPackageId){
        userCommission = commission;
        referrerCommission = commission;
      }
    });

    if (userCommission === null || referrerCommission === null) {
      console.error("Error mapping package IDs to commissions.");
      return callback(new Error("Error mapping package IDs to commissions."), null);
    }

    console.log(userCommission, "-", referrerCommission);

    // Return the lower commission
    return callback(null, Math.min(userCommission, referrerCommission));
  });
};


exports.createUser = (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading avatar image', error: err });
    }

    const { name, package_id, email, phone, gender, Address, Pincode, generatedReferralCode, referrerId, referrercode } = req.body;
    const avatar = req.file ? req.file.filename : null; // Get the uploaded avatar filename

    // Validate the data
    if (!name || !package_id || !email || !phone || !gender) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Prepare SQL query to insert user data
    const userQuery = `
      INSERT INTO user (Name, PackageId, Email, Phone, Gender, Avatar, Address, Pincode, GeneratedReferralCode, ReferrerId, reffercode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const userValues = [
      name,
      package_id,
      email,
      phone,
      gender,
      avatar, // Storing the filename of the avatar
      Address || null,
      Pincode || null,
      generatedReferralCode || null,
      referrerId || null,
      referrercode || null,
    ];

    // Execute the query to insert user data
    connection.query(userQuery, userValues, (err, result) => {
      if (err) {
        console.error('Error inserting data into users table:', err);
        return res.status(500).json({ message: 'Error creating user', error: err });
      }

      const userId = result.insertId; // Get the newly created user ID

      // Insert a record into the wallet table with default balance
      const walletQuery = `
        INSERT INTO wallet (user_id, balance) 
        VALUES (?, ?)
      `;
      const walletValues = [userId, 0.00];

      connection.query(walletQuery, walletValues, (err, walletResult) => {
        if (err) {
          console.error('Error inserting data into wallet table:', err);
          return res.status(500).json({ message: 'Error creating user wallet', error: err });
        }

        // If a referral code is provided, process referral logic
        if (referrercode) {
          const referrerQuery = `
            SELECT userid, PackageId FROM user WHERE GeneratedReferralCode = ?
          `;

          connection.query(referrerQuery, [referrercode], (err, referrerResult) => {
            if (err) {
              console.error('Error finding referrer:', err);
              return res.status(500).json({ message: 'Error processing referral code', error: err });
            }

            if (referrerResult.length > 0) {
              const referrerId = referrerResult[0].userid;
              const referrerPackageId = referrerResult[0].PackageId;
              console.log(referrerId, "-", referrerPackageId);
            
              returnCommissionMethod(package_id, referrerPackageId, (err, referralCommission) => {
                if (err) {
                  return res.status(500).json({ message: 'Error calculating referral commission', error: err });
                }
                console.log(referralCommission);
            
                // Update referrer's wallet balance
                const updateWalletQuery = `
                  UPDATE wallet SET balance = balance + ? WHERE user_id = ?
                `;
                connection.query(updateWalletQuery, [referralCommission, referrerId], (err) => {
                  if (err) {
                    console.error('Error updating referrer wallet:', err);
                    return res.status(500).json({ message: 'Error updating referrer wallet', error: err });
                  }
            
                  // Fetch referrer's wallet ID to use in transactions
                  const fetchWalletIdQuery = `
                    SELECT wallet_id FROM wallet WHERE user_id = ?
                  `;
                  connection.query(fetchWalletIdQuery, [referrerId], (err, walletRows) => {
                    if (err || walletRows.length === 0) {
                      console.error('Error fetching wallet ID:', err || 'No wallet found for referrer');
                      return res.status(500).json({ message: 'Error fetching wallet ID', error: err });
                    }
            
                    const referrerWalletId = walletRows[0].wallet_id; // Ensure this matches your wallet table structure
            
                    // Record the transaction in wallettransactions table
                    const transactionQuery = `
                      INSERT INTO wallettransactions (user_id, wallet_id, amount, transaction_type, description) 
                      VALUES (?, ?, ?, ?, ?)
                    `;
                    const transactionValues = [
                      referrerId,
                      referrerWalletId, // Pass the fetched wallet ID here
                      referralCommission,
                      'credit', // Transaction type
                      `Referral commission for user ${referrerId}`,
                    ];
            
                    connection.query(transactionQuery, transactionValues, (err) => {
                      if (err) {
                        console.error('Error recording wallet transaction:', err);
                        return res.status(500).json({ message: 'Error recording wallet transaction', error: err });
                      }
            
                      res.status(201).json({
                        message: 'User and wallet created successfully with referral bonus',
                        userId: userId,
                        walletId: walletResult.insertId,
                      });
                    });
                  });
                });
              });
            } else {
              res.status(201).json({
                message: 'User and wallet created successfully (no referrer found)',
                userId: userId,
                walletId: walletResult.insertId,
              });
            }
          });            
        } else {
          res.status(201).json({
            message: 'User and wallet created successfully',
            userId: userId,
            walletId: walletResult.insertId,
          });
        }
      });
    });
  });
};
exports.getUserById = (req, res) => {
  const userId = req.params.user_id; // Assume user ID is provided as a URL parameter

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  // Query to fetch user details from the user table
  const userQuery = `
    SELECT 
      userid AS userId,
      Name AS name,
      PackageId AS packageId,
      Email AS email,
      Phone AS phone,
      Gender AS gender,
      Avatar AS avatar,
      Address AS Address,
      Pincode AS Pincode,
      GeneratedReferralCode AS generatedReferralCode,
      ReferrerId AS referrerId,
      reffercode AS referralCode
    FROM user
    WHERE userid = ?
  `;

  connection.query(userQuery, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user details:', err);
      return res.status(500).json({ message: 'Error fetching user details', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userDetails = results[0];

    res.status(200).json({
      message: 'User details retrieved successfully',
      user: {
        userId: userDetails.userId,
        name: userDetails.name,
        packageId: userDetails.packageId,
        email: userDetails.email,
        phone: userDetails.phone,
        gender: userDetails.gender,
        avatar: userDetails.avatar,
        Address: userDetails.Address,
        Pincode: userDetails.Pincode,
        generatedReferralCode: userDetails.generatedReferralCode,
        referrerId: userDetails.referrerId,
        referralCode: userDetails.referralCode,
      },
    });
  });
};
exports.updateUser = (req, res, next) => {
  // Handle avatar upload
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading avatar image', error: err });
    }

    const userId = req.params.user_id; // Extract user ID from route params
    const {
      name,
      package_id,
      email,
      phone,
      gender,
      Address,
      Pincode,
      generatedReferralCode,
      referrerId,
      referrercode,
    } = req.body;

    const avatar = req.file ? req.file.filename : null; // Get the new avatar filename if provided

    // Validate required fields
    if (!userId || !name || !package_id || !email || !phone || !gender) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Prepare query and data for updating user details
    const updateUserQuery = `
      UPDATE user
      SET 
        Name = ?, 
        PackageId = ?, 
        Email = ?, 
        Phone = ?, 
        Gender = ?, 
        Avatar = COALESCE(?, Avatar), 
        Address = ?, 
        Pincode = ?, 
        GeneratedReferralCode = ?, 
        ReferrerId = ?, 
        reffercode = ?
      WHERE userid = ?
    `;

    const updateUserValues = [
      name,
      package_id,
      email,
      phone,
      gender,
      avatar,
      Address || null,
      Pincode || null,
      generatedReferralCode || null,
      referrerId || null,
      referrercode || null,
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

      // Handle referral code logic if provided
      if (referrercode) {
        const referrerQuery = `
          SELECT userid, PackageId FROM user WHERE GeneratedReferralCode = ?
        `;

        connection.query(referrerQuery, [referrercode], (err, referrerResult) => {
          if (err) {
            console.error('Error finding referrer:', err);
            return res.status(500).json({ message: 'Error processing referral code', error: err });
          }

          if (referrerResult.length > 0) {
            const referrerId = referrerResult[0].userid;
            const referrerPackageId = referrerResult[0].PackageId;
            console.log('Referrer Found:', referrerId, '-', referrerPackageId);

            returnCommissionMethod(package_id, referrerPackageId, (err, referralCommission) => {
              if (err) {
                return res.status(500).json({ message: 'Error calculating referral commission', error: err });
              }
              console.log('Referral Commission:', referralCommission);

              // Update referrer's wallet
              const updateWalletQuery = `
                UPDATE wallet SET balance = balance + ? WHERE user_id = ?
              `;
              connection.query(updateWalletQuery, [referralCommission, referrerId], (err) => {
                if (err) {
                  console.error('Error updating referrer wallet:', err);
                  return res.status(500).json({ message: 'Error updating referrer wallet', error: err });
                }

                // Record wallet transaction
                const transactionQuery = `
                  INSERT INTO wallettransactions (user_id, wallet_id, amount, transaction_type, description)
                  VALUES (?, (SELECT wallet_id FROM wallet WHERE user_id = ?), ?, ?, ?)
                `;
                const transactionValues = [
                  referrerId,
                  referrerId,
                  referralCommission,
                  'credit',
                  `Referral commission for user ${userId}`,
                ];

                connection.query(transactionQuery, transactionValues, (err) => {
                  if (err) {
                    console.error('Error recording wallet transaction:', err);
                    return res.status(500).json({ message: 'Error recording wallet transaction', error: err });
                  }

                  return res.status(200).json({
                    message: 'User details updated successfully with referral bonus applied',
                  });
                });
              });
            });
          } else {
            return res.status(200).json({
              message: 'User details updated successfully (no referrer found)',
            });
          }
        });
      } else {
        res.status(200).json({ message: 'User details updated successfully' });
      }
    });
  });
};
