import dbConnect from "../../../lib/dbConnect";
import UserModel from "../../../model/User";
import bcrypt from 'bcrypt'
import { sendVerificationEmail } from "../../../helpers/sendVerificationEmails";


export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        { status: 400 }
      );
    }
    const existingUserbyEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserbyEmail) {
      if (existingUserbyEmail.isVerified) {
        return Response.json ({
            success:false,
            message: "User already exists with this email"
        }, {status:400})
      } else {
        const hashedPassword = await bcrypt.hash(password, 10)
        existingUserbyEmail.password = hashedPassword;
        existingUserbyEmail.verifyCode = verifyCode;
        existingUserbyEmail.verifyCodeExpiry = new
        Date(Date.now() + 3600000)
        await existingUserbyEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUser.save();
    }

    

    
    //Send Verification Email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    )

    if (!emailResponse.success) {
        return Response.json({
          success:false,
          message: emailResponse.message
        }, {status: 500})
    }

    return Response.json({
        success:true,
        message: "User registered successfully. Please check your email to verify account."
      }, {status: 201})


  } catch (error) {
    console.error("Error registering user", error);
    return Response.json({
      status: 500,
      success: false,
      message: "Error registering user",
    });
  }
}





/*
This code is a server-side function for handling user registration in a web application. Let's break down how it works:

1. **Imports**:
   - It imports necessary modules such as `dbConnect` for database connection, `UserModel` for interacting with the User model, `bcrypt` for password hashing,
    and `sendVerificationEmail` for sending verification emails.

2. **POST Request Handler**:
   - The `POST` function is an asynchronous function that handles HTTP POST requests.
   - It first connects to the database using `dbConnect()`.

3. **Request Processing**:
   - It extracts the `username`, `email`, and `password` from the request body.
   - It checks if there is an existing user with the same username and is already verified. If found, it returns an error response.
   - It then checks if there is an existing user with the same email. If found:
     - If the user is already verified, it returns an error response.
     - If the user is not verified, it updates the user's password, verification code, and expiry date.
   - If there is no existing user with the same email, it hashes the password, generates a verification code, and sets the verification code's expiry date.
   - It creates a new user instance with the provided details and saves it to the database.

4. **Sending Verification Email**:
   - After saving the user data, it sends a verification email to the user's email address containing the verification code.
   - If the email sending is unsuccessful, it returns an error response.

5. **Response Handling**:
   - If everything is successful, it returns a success response with a message indicating successful user registration and a status code of 201 (Created).
   - If there is an error during the process, it catches the error, logs it, and returns an error response with a status code of 500 (Internal Server Error) and an appropriate error message.

Overall, this code registers users by checking if they already exist, updating their information if necessary, saving new users to the database, and sending them 
verification emails. It handles errors gracefully and provides appropriate responses.
*/