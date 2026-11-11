
package backend.techlab.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import backend.techlab.model.Ventas;
import backend.techlab.repository.VentaRepository;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    @Autowired
    private VentaRepository ventaRepository;

    @GetMapping
    public List<Ventas> listarVentas() {
        // Devuelve todas las ventas ordenadas o completas para el historial
        return ventaRepository.findAll();
    }
}

