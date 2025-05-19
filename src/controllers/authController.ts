import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import { RegisterDTO, LoginDTO } from '../dto/auth_dto';
import logger from '../lib/logger';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const login = async (req: Request<{}, {}, LoginDTO>, res: Response) => {
    const { email, password } = req.body;
    logger.info(`Logging in user with email: ${email}`);
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    logger.info(`User found!`);
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    logger.info(`Password is valid!`);
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
};

export const register = async (req: Request<{}, {}, RegisterDTO>, res: Response) => {
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
}

export const logout = async (req: Request, res: Response) => {
    res.clearCookie('token');
    logger.info(`Logged out successfully`);
    res.status(200).json({ message: 'Logged out successfully' });
}

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
    const { email, username, password } = req.body;
    logger.info(`Creating user with email: ${email}`);
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await prisma.user.findUnique({ where: { email } });

    // if user already exists, return error
    if (user) {
        logger.info(`Email already exists!`);
        return res.status(400).json({ error: 'Email already exists' });
    }

    // check if username already exists
    user = await prisma.user.findFirst({
        where: {
            userName: username
        }
    });
    // if username already exists, return error
    if (user) {
        logger.info(`Username already exists!`);
        return res.status(400).json({ error: 'Username already exists' });
    }
    logger.info(`Username does not exist!`);
    user = await prisma.user.create({
        data: {
            email,
            userName: username,
            password: hashedPassword,
            role: 'USER'
        }
    });
    logger.info(`User created!`);
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ message: 'User created successfully', token });
}