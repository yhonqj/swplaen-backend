import express from 'express';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import router from './routes/app';

import pool from './settings/db'

const app = express();

const corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200
}

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), ()=> {
    console.log('server on port: ', app.get('port'))
})

app.use(morgan('dev'));
app.use(cors());

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', cors(corsOptions), router);
app.use(express.static(path.join(__dirname,'public')))