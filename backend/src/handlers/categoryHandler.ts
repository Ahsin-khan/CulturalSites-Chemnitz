import express, { Request, Response } from 'express';
import { CategoryModel } from '../models/category';
import { CategoryCreation } from '../types/types';

const categoryStore = new CategoryModel();

const index = async (req: Request, res: Response) => {
  try {
    const categories = await categoryStore.getAll();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error in index (getAllCategories):', error);
    res.status(500).json({ message: 'Error getting categories' });
  }
};

const show = async (req: Request, res: Response) => {
  try {
    const categoryId = parseInt(req.params.id);
    const category = await categoryStore.show(categoryId);

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    res.status(200).json(category);
  } catch (error) {
    console.error('Error in show (getCategoryById):', error);
    res.status(500).json({ message: 'Error getting category' });
  }
};

const getSiteCategories = async (req: Request, res: Response) => {
  try {
    const siteId = parseInt(req.params.siteId);
    const categories = await categoryStore.getBySiteId(siteId);
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error in getSiteCategories:', error);
    res.status(500).json({ message: 'Error getting site categories' });
  }
};

const categoriesRoutes = (app: express.Application) => {
  app.get('/categories', index); // GET all categories
  app.get('/categories/:id', show); // GET category by ID
  app.get('/categories/site/:siteId', getSiteCategories); // GET categories by siteId
};

export { categoriesRoutes };
