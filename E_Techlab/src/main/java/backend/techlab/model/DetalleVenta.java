
package backend.techlab.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "detalleVenta")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DetalleVenta {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDetalle;
    
    @Column(name = "nombreProducto")
    private String nombreProducto;
    
    @Column(name = "cantidad")
    private Integer cantidad;
    
    @Column(name = "precioUnitario")
    private BigDecimal precioUnitario;
}
