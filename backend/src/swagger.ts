import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import swaggerDocument from './swaggerSpec.json'; // <- import JSON directly

export const setupSwaggerDocs = (app: Application) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
