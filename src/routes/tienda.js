import routerx from 'express-promise-router';
import { add, addProducto, updateProducto } from '../controllers/tienda';

const app = routerx();
app.post('/add', add);
app.patch('/addProducto', addProducto);
app.patch('/updateProducto', updateProducto);

export default app;