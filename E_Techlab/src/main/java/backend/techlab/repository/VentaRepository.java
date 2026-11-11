
package backend.techlab.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import backend.techlab.model.Ventas;

@Repository
public interface VentaRepository extends JpaRepository<Ventas, Long>{
    
}
