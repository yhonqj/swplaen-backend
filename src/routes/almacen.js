import routerx from 'express-promise-router';
import AlmacenController from '../controllers/almacen';
import { check } from 'express-validator'
import valid from '../middlewares/validation'

const app = routerx();
app.get('/getAll', AlmacenController.getAll);
app.get('/getProductoById', AlmacenController.getProductoById);
app.get('/getAllPaginate', [
    check('limit', 'El límite es obligatorio').not().isEmpty(),
    check('page', 'La página es obligatoria').not().isEmpty(),
    valid.validCampos
],AlmacenController.getAllPaginate);
app.get('/getById', AlmacenController.getById);
app.post('/add', AlmacenController.add);
app.put('/update', AlmacenController.update);
app.delete('/remove', AlmacenController.remove);
app.patch('/addProducto', AlmacenController.addProducto);
app.patch('/updateProducto', AlmacenController.updateProducto);
app.patch('/removeProducto', AlmacenController.removeProducto);

export default app;