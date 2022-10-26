import routerx from 'express-promise-router';
import Almacen from './almacen';
import AlmacenMp from './almacenMp';
import Tienda from './tienda';
import Producto from './producto';
import CategoriaProducto from './categoriaProducto';
import Usuario from './usuario';
import MateriaPrima from './materiaPrima';
import Proveedor from './proveedor';
import Orden from './orden';

const router = routerx();

router.use('/almacen', Almacen);
router.use('/almacenMp', AlmacenMp);
router.use('/tienda', Tienda);
router.use('/producto', Producto);
router.use('/materiaPrima', MateriaPrima);
router.use('/categoriaProducto', CategoriaProducto);
router.use('/usuario', Usuario);
router.use('/proveedor', Proveedor);
router.use('/orden', Orden);

export default router;