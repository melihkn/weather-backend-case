import { User } from "@prisma/client";

type UserResponse = Omit<User, 'password'>;

export interface UpdateUserRoleDTO {
    id: number;
    role: string;
}

export interface UpdateUserRoleResponse {
    message: string;
    user: User;
}

export interface GetAllUsersResponse {
    users: UserResponse[];
}

export interface CreateUserDTO {
    email: string;
    password: string;
    username: string;
}

export interface CreateUserResponse {
    message: string;
    user: User;
}


export interface DeleteUserDTO {
    id: number;
}

export interface DeleteUserResponse {
    message: string;
}