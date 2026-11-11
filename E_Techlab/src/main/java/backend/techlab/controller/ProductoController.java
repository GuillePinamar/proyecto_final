package backend.techlab.controller;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import backend.techlab.model.ItemCarritoDTO;
import backend.techlab.model.Producto;
import backend.techlab.service.ProductoService;

@Controller
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    private final ProductoService productoServicio;

    @Autowired
    public ProductoController(ProductoService productoServicio) {
        this.productoServicio = productoServicio;
    }

    @GetMapping
    public ResponseEntity<List<Producto>> listarProductos() {
        List<Producto> productos = productoServicio.listarTodos();
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerPorId(@PathVariable Long id) {
        Optional<Producto> producto = productoServicio.buscarPorId(id);
        return producto.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Producto> crearProducto(@RequestBody Producto producto) {
        producto.setIdProducto(null);
        Producto nuevoProducto = productoServicio.agregarProducto(producto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Long id, @RequestBody Producto productoDetalle) {
        Optional<Producto> productoExistente = productoServicio.buscarPorId(id);
        if (productoExistente.isPresent()) {
            productoDetalle.setIdProducto(id);
            Producto productoActualizado = productoServicio.agregarProducto(productoDetalle);
            return ResponseEntity.ok(productoActualizado);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        Optional<Producto> producto = productoServicio.buscarPorId(id);
        if (producto.isPresent()) {
            productoServicio.eliminarProducto(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/comprar")
    public ResponseEntity<?> finalizarCompra(@RequestBody List<ItemCarritoDTO> items) {
        try {
            productoServicio.procesarCompra(items);
            return ResponseEntity.ok("Compra procesada con éxito. Stock actualizado.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
