import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import logger from './core/logger/app-logger'
import morgan from 'morgan'
import config from './core/config/config.dev'
import cars from './routes/cars.route'
import users from './routes/users.route'
import cm from './routes/cm.route'
import quest from './routes/quest.route'
import purifiers from './routes/purifiers.route'
import connectToDb from './db/connect'
import multer from "multer";
import path from "path";

var upload = multer({ dest: 'uploads/'})

const port = config.serverPort;
logger.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};

connectToDb();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev", { "stream": logger.stream }));

app.use('/users', users);
app.use('/cars', cars);
app.use('/purifiers', purifiers);
app.use('/cm', cm);
app.use('/quests', quest);

//Index route
app.get('/', (req, res) => {
    // res.send('tesat');
    res.sendFile(path.join(__dirname + '/index.html'))
});

app.listen(port, () => {
    logger.info('server started - ', port);
});