import {api} from './api';
import {CreateUserRequest, LoginRequest, LoginResponse, UpdateUserRequest, User} from '@/types/user';

export const userService = {
  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials);

    // Adapt backend response to frontend format
    // Backend returns: { access_token, user: { _id, ... } }
    // Frontend expects: { token, user: { id, token, ... } }
    return {
      token: response.data.access_token,
      user: {
        id: response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role,
        token: response.data.access_token,
      }
    };
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  },

  // User CRUD
  async getUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await api.post('/users', userData);
    return response.data;
  },

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
