import routerx from 'express-promise-router';
import CategoriaProductoController from '../controllers/categoriaProducto';

const app = routerx();
app.get('/getAll', CategoriaProductoController.getAll);

export default app;