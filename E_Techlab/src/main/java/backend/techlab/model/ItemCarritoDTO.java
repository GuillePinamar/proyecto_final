package backend.techlab.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemCarritoDTO {

    private Long idProducto;
    private int cantidad;

}
