import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { RegisterDTO, LoginDTO } from '../dto/auth_dto';
import logger from '../lib/logger';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const login = async (req: Request<{}, {}, LoginDTO>, res: Response) => {
    try {
        const { email, password } = req.body;
        logger.info(`Logging in user with email: ${email}`);
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            logger.error(`User not found with email: ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        logger.info(`User found!`);
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            logger.error(`Invalid password for user: ${email}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        logger.info(`Password is valid!`);
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        logger.info(`Login successful for user: ${email}`);
        res.json({ token });
    } catch (err: any) {
        logger.error(`Error during login: ${err.message || err}`);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const register = async (req: Request<{}, {}, RegisterDTO>, res: Response) => {
    try {
        const { email, username, password } = req.body;
        logger.info(`Registering user with email: ${email}`);

        const hashedPassword = await bcrypt.hash(password, 10);

        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { userName: username }
                ]
            }
        });
        // if user already exists, return error
        if (user) {
            logger.info(`User already exists!`);
            return res.status(400).json({ error: 'User already exists' });
        }
        logger.info(`User does not exist!`);
        user = await prisma.user.create({
            data: {
                email,
                userName: username,
                password: hashedPassword, 
                role: 'USER'
            }
        });
        logger.info(`User created!`);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err: any) {
        logger.error(`Error registering user: ${err.message || err}`);
        res.status(500).json({ error: 'Internal server error' });
    }
}
