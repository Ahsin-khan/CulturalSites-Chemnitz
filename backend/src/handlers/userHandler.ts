import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user'; 
import { User, UserCreation, UserAuthentication } from '../types/types';
import { verifyAuthToken } from '../helpers/verifyAuthToken';

const userStore = new UserModel();
const token_secret = process.env.TOKEN_SECRET || 'your-secret-key'; 

// Register new user
const register = async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      location_lat,
      location_lon
    } = req.body;

    if (!username || !email || !password) {
      res
        .status(400)
        .json({ message: 'Username, email, and password are required.' });
      return;
    }

    const userData: UserCreation = {
      username,
      email,
      password,
      first_name,
      last_name,
      location_lat,
      location_lon
    };

    const newUser = await userStore.create(userData);

    // Create JWT token for new user
    const token = jwt.sign(
      { user_id: newUser.id, username: newUser.username },
      token_secret,
      {
        expiresIn: '1h'
      }
    );

    // Return new user (without password_hash) and token
    const { password_hash, ...userWithoutPassword } = newUser;
    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      res.status(409).json({ message: error.message });
      return;
    }
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Login user
const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Username and password are required.' });
      return;
    }

    const authenticatedUser = await userStore.authenticate(username, password);

    if (!authenticatedUser) {
      res.status(401).json({ message: 'Invalid username or password.' });
      return;
    }

    const token = jwt.sign(
      { user_id: authenticatedUser.id, username: authenticatedUser.username },
      token_secret,
      {
        expiresIn: '1h'
      }
    );

    const { password_hash, ...userWithoutPassword } = authenticatedUser;
    res.status(200).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Get current user info
const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, token_secret);
    if (!decoded?.user_id) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const user = await userStore.show(decoded.user_id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const { password_hash, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ message: 'Error getting current user' });
  }
};

// Update current user
const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, token_secret);
    if (!decoded?.user_id) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const userId = decoded.user_id;

    // Fix: Prevent TypeError by defaulting to {}
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      location_lat,
      location_lon
    } = req.body || {};

    const updatedUser = await userStore.update(userId, {
      username,
      email,
      password,
      first_name,
      last_name,
      location_lat,
      location_lon
    });

    const { password_hash, ...userWithoutPassword } = updatedUser;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('No fields to update')
    ) {
      res.status(400).json({ message: 'No fields to update' });
    } else {
      res.status(500).json({ message: 'Error updating user' });
    }
  }
};

// Export a function to register routes on your Express app
const userRoutes = (app: express.Application) => {
  app.post('/register', register);
  app.post('/login', login);
  app.get('/me', verifyAuthToken, getCurrentUser);
  app.put('/me', verifyAuthToken, updateCurrentUser);
};

export { userRoutes };
