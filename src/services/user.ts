import {createHmac, randomBytes} from 'node:crypto';
import JWT from 'jsonwebtoken';
import { prismaClient } from '../lib/db';
import { User } from '../grapgql/user';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
export interface CreateUserPayload{
    firstName:string
    lastName?:string
    email:string
    password:string 
}
export interface GetUserTokenPayload{
    email:string;
    password:string;
}
export class UserService{
    private static generateHash(salt: string, password: string): string {
        return createHmac('sha256', salt).update(password).digest('hex');
    }
    public static createUser(payload:CreateUserPayload){
    const {firstName,lastName,email,password}=payload;
    const salt = randomBytes(32).toString('hex'); // Generate a random salt
    const hashedPassword = UserService.generateHash(salt, password); // Hash the password with the salt
    return prismaClient.user.create({
        data:{
            firstName,
            lastName,
            email,
            salt,
            password: hashedPassword, // In a real application, make sure to hash the password before storing it
        }
    });
    }

    private static getUserByEmail(email:string){
    return prismaClient.user.findUnique({
       where :{email}
    })
    }
    public static async getUserToken(payload: GetUserTokenPayload){
      const {email, password} = payload;
      const user=await UserService.getUserByEmail(email);
      if(!user){
        throw new Error('user not found');
      }
      const userSalt= user.salt;
      const usersHashedPassword = UserService.generateHash(userSalt, password);
      if(usersHashedPassword !== user.password){
        throw new Error('Invalid password');
      }
      // Generate a token (for simplicity, we'll just return the user ID)
     const token = JWT.sign({id:user.id, email:user.email},'JWT_SECRET');
      return token;   
    }
    public static decodeJWTToken(token: string){
        return JWT.verify(token,JWT_SECRET);
    }

    public static getUserById(id: string) {
        return prismaClient.user.findUnique({
            where: { id }
        });
    }
}
