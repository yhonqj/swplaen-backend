import routerx from 'express-promise-router';
import OrdenController from '../controllers/orden';
import { check } from 'express-validator'
import valid from '../middlewares/validation'

const app = routerx();

app.post('/add', OrdenController.add);
app.get('/getAll', OrdenController.getAll);
app.get('/getAllPaginate', OrdenController.getAllPaginate);
app.get('/getMateriasPrimasByIdPaginate', OrdenController.getMateriasPrimasByIdPaginate);
app.get('/getById', OrdenController.getById);
app.patch('/aceptar', OrdenController.aceptar);
app.patch('/rechazar', OrdenController.rechazar);
app.patch('/completar', OrdenController.completar);
app.patch('/reprogramar', OrdenController.reprogramar);

export default app;