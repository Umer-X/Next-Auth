import {z} from 'zod';

export const usernameValidation = z
.string()
.min(3, {message: 'Username must be at least 3 characters'})
.max(20, {message: 'Username must be at most 20 characters'})
  .regex(
    /^[a-zA-Z0-9]+(?:[ _-][a-zA-Z0-9]+)*$/,
    "Username must be alphanumeric and may contain _special characters"
  );


  export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: 'Email must be a valid email address'}),
    password: z.string().min(6,{message: 'Password must be at least 8 characters'}),
  })