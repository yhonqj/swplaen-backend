import routerx from 'express-promise-router';
import ProveedorController from '../controllers/proveedor';
import { check } from 'express-validator'
import valid from '../middlewares/validation'

const app = routerx();

app.post('/add', ProveedorController.add);
app.patch('/addMateriaPrima', ProveedorController.addMateriaPrima);
app.get('/getAll', ProveedorController.getAll);
app.get('/getAllPaginate', ProveedorController.getAllPaginate);
app.get('/getMateriasPrimasById', ProveedorController.getMateriasPrimasById);
app.get('/getMateriasPrimasByIdPaginate', ProveedorController.getMateriasPrimasByIdPaginate);
app.get('/getMateriasPrimasPaginate', ProveedorController.getMateriasPrimasPaginate);
app.get('/getOrdenesPaginate', ProveedorController.getOrdenesPaginate);
app.get('/getById', ProveedorController.getById);
app.put('/update', ProveedorController.update);
app.delete('/remove', ProveedorController.remove);

export default app;