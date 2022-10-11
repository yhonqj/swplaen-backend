import routerx from 'express-promise-router';
import Almacen from './almacen';
import Tienda from './tienda';
import Producto from './producto';
import CategoriaProducto from './categoriaProducto';
import Usuario from './usuario';

const router = routerx();

router.use('/almacen', Almacen);
router.use('/tienda', Tienda);
router.use('/producto', Producto);
router.use('/categoriaProducto', CategoriaProducto);
router.use('/usuario', Usuario);

export default router;