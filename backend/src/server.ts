import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';


// Import handlers (from handlers folder)
import { userRoutes } from './handlers/userHandler';
import { culturalSiteRoutes } from './handlers/culturalSiteHandler';
import { favoriteRoutes } from './handlers/favoriteHandler';
import { reviewRoutes } from './handlers/reviewHandler';
import { categoriesRoutes } from './handlers/categoryHandler';
import { dashboardRoutes } from './handlers/dashboardHandler';
import { startOSMCronJob } from './osmCron';
import { setupSwaggerDocs } from './swagger';

startOSMCronJob();

const app: express.Application = express();
const address: string = '0.0.0.0:3000';

const corsOptions = {
  origin: '*',
  optionSuccessStatus: 200 //some legacy browsers (IE11)
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Root route - simple message
app.get('/', function (req: Request, res: Response) {
  res.send('Hello World!');
});


setupSwaggerDocs(app);

// User routes
userRoutes(app);

/* CulturalSite routes */
culturalSiteRoutes(app);

/* favorite routes */
favoriteRoutes(app);

/* review routes */
reviewRoutes(app);

/* category routes */
categoriesRoutes(app);

/* dashboard routes */
dashboardRoutes(app);


app.listen(3000, function () {
  console.log(`starting app on: ${address}`);
});

export default app;

