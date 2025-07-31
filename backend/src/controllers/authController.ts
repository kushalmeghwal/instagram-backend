import type { Request, Response } from 'express';
import { pool } from '../config/databse.ts';
import { genSalt, hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { IncomingForm } from 'formidable';
import { FileUpload } from '../utils/fileUpload.ts';

dotenv.config();

interface Auth {
  // signup(request: Request, response: Response): Promise<Response>;
  signup(request: Request, response: Response): void;
  // signin(request: Request, response: Response): Promise<Response>;
  signin(request: Request, response: Response): void;
}

export class AuthController implements Auth {
  async signup(request: Request, response: Response) {

    
    const { username, email, password, fullname, bio } = request.body;

    
    if (!username || !email || !password || !fullname || !bio) {
      return response.status(400).json({ msg: 'All fields are required' });
    }
    
    const query = 'INSERT INTO users (username, email, password, fullname, bio) VALUES ($1, $2, $3, $4, $5)';
    
    const salt = await genSalt(18);
    const hashedPassword = await hash(password, salt);
    try {
      
      await pool.query(query, [username, email, hashedPassword, fullname, bio]);
      console.log("Account created successfully")

  return response.status(201).json({ msg: 'Account created successfully' });
} catch (error) {
    console.log(error)
  return response.status(500).json({ error: 'Internal server error', details: error });
}

  }
        // const profile_url = await FileUpload(profile?.[0]?.filepath);
        // console.log("profile url",profile_url);
    


  async signin(request: Request, response: Response) {
 
    const { email, password } = request.body;
  

    if (!email || !password) {
      return response.status(400).json({ msg: 'All fields are required' });
    }

   const emailStr = Array.isArray(email) ? email[0] : email;
try{

const query = 'SELECT * FROM users WHERE email=$1';
const user = (await pool.query(query, [emailStr])).rows[0];

    console.log(user)
    if (!user) {
      return response.status(404).json({ msg: 'Accout with this email does not exist' });
    }

    const hashedPassword = user.password;
    const isPasswordValid = await compare(password, hashedPassword);

    if (!isPasswordValid) {
      return response.status(400).json({ msg: 'Invalid password' });
    }
    const token_payload = {
      username: user.username,
      email: user.email,
    };
    const secret = process.env.COOKIE_SECRET;
  
    if (!secret) {
      return response.status(500).json({ msg: 'JWT secret is not defined in environment variables' });
    }
    const token = jwt.sign(token_payload, secret, { expiresIn: '1d' });
    console.log("user logged in successfully")
    return response.status(200).json({ "token generated":token });
}catch(err){
  console.log(err)
    return response.status(400).json({ msg: 'error while running the query' });
}
}
}