package backend.techlab.service;

import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import backend.techlab.model.DetalleVenta;
import backend.techlab.model.ItemCarritoDTO;
import backend.techlab.model.Producto;
import backend.techlab.model.Ventas;
import backend.techlab.repository.ProductoRepository;
import backend.techlab.repository.VentaRepository;

@Service
public class ProductoService {

    private final ProductoRepository productoRep;
    private final VentaRepository ventasRepository;

    @Autowired
    public ProductoService(ProductoRepository productoRep, VentaRepository ventasRepository) {
        this.productoRep = productoRep;
        this.ventasRepository = ventasRepository;
    }

    public Producto agregarProducto(Producto p) {
        return productoRep.save(p);
    }

    public Optional<Producto> buscarPorId(Long id) {
        return productoRep.findById(id);
    }

    public void eliminarProducto(Long id) {
        productoRep.deleteById(id);
    }

    public List<Producto> listarTodos() {
        return productoRep.findAll();
    }

    @Transactional
    public void procesarCompra(List<ItemCarritoDTO> items) {
        Ventas venta = new Ventas();
        BigDecimal totalVenta = BigDecimal.ZERO;
        List<DetalleVenta> detalles = new ArrayList<>();

        for (ItemCarritoDTO item : items) {
            Producto producto = productoRep.findById(item.getIdProducto()).orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            if (producto.getStock() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
            }

            // Descontar stock
            producto.setStock(producto.getStock() - item.getCantidad());
            productoRep.save(producto);

            // Crear detalle de venta
            DetalleVenta detalle = new DetalleVenta();
            detalle.setNombreProducto(producto.getNombre());
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecio());
            detalles.add(detalle);

            // Calcular subtotal
            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(item.getCantidad()));
            totalVenta = totalVenta.add(subtotal);
        }

        venta.setTotal(totalVenta);
        venta.setDetalles(detalles);
        ventasRepository.save(venta); // ¡Esto guarda la venta para el historial!
    }

}
