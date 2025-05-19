import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';
import logger from '../lib/logger';
import bcrypt from 'bcrypt';
import { GetAllUsersResponse, UpdateUserRoleDTO, UpdateUserRoleResponse, CreateUserDTO, CreateUserResponse, DeleteUserDTO, DeleteUserResponse } from '../dto/admin_dto';
import { ApiResponse } from '../types/ApiResponse';
import { Role } from '@prisma/client';
// GET /api/admin/users
export const getAllUsers = async (req: AuthenticatedRequest, res: Response<ApiResponse<GetAllUsersResponse>>) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        userName: true,
        email: true,
        role: true,
      },
    });
    logger.info('Users fetched successfully for admin');
    res.json({success: true, data: {users}});
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
};  

// PATCH /api/admin/users/role
export const updateUserRole = async (req: AuthenticatedRequest<{}, {},UpdateUserRoleDTO>, res: Response<ApiResponse<UpdateUserRoleResponse>>) => {
  const userId = req.body.id;
  const { role } = req.body;

  if (!['USER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid role' });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
    });

    res.json({success: true, data: {message: 'Role updated', user: updated} });
  } catch (err) {
    res.status(404).json({ success: false, error: 'User not found' });
  }
};

// POST /api/admin/users
export const createUserByAdmin = async (req: AuthenticatedRequest<{}, {},CreateUserDTO>, res: Response<ApiResponse<CreateUserResponse>>) => {
    const { email, password, username } = req.body;
  
    if (!email || !password || !username) {
      return res.status(400).json({ success: false, error: 'Missing or invalid fields' });
    }
  
    try {
      const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { userName: username }] },
      });
  
      if (existing) {
        return res.status(400).json({ success: false, error: 'Email or username already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          userName: username,
          role: "USER",
        },
      });
  
      res.status(201).json({ success: true, data: {message: 'User created', user: newUser} });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to create user' });
    }
  };
  
  // DELETE /api/admin/users
  export const deleteUserByAdmin = async (req: AuthenticatedRequest<{}, {},DeleteUserDTO>, res: Response<ApiResponse<DeleteUserResponse>>) => {
    const userId = req.body.id;
  
    try {
      await prisma.user.delete({ where: { id: userId } });
      res.json({success: true, data: {message: 'User deleted successfully' } });
    } catch (err) {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  };
