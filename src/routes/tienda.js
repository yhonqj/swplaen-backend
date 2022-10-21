import routerx from 'express-promise-router';
import { add, addProducto, getAllPaginate, getById, updateProducto , getProductosByIdPaginate,getProductosById} from '../controllers/tienda';

const app = routerx();
app.post('/add', add);
app.get('/getAllPaginate', getAllPaginate);
app.get('/getById', getById);
app.get('/getProductosByIdPaginate', getProductosByIdPaginate);
app.get('/getProductosById', getProductosById);
app.patch('/addProducto', addProducto);
app.patch('/updateProducto', updateProducto);

export default app;