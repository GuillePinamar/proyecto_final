package backend.techlab.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import backend.techlab.model.Categoria;
import backend.techlab.repository.CategoriaRepository;

@RestController
@RequestMapping("/api/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {

    @Autowired
    private CategoriaRepository categoriaRepository;

    // 1. Listar todas las categorías
    @GetMapping
    public List<Categoria> listarCategorias() {
        return categoriaRepository.findAll();
    }

    // 2. Crear una nueva categoría
    @PostMapping
    public ResponseEntity<?> crearCategoria(@RequestBody Categoria categoria) {
        try {
            Categoria nuevaCategoria = categoriaRepository.save(categoria);
            return ResponseEntity.ok(nuevaCategoria);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al crear la categoría: " + e.getMessage());
        }
    }

    // 3. Actualizar una categoría existente
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCategoria(@PathVariable Long id, @RequestBody Categoria categoriaDetalles) {
        return categoriaRepository.findById(id).map(categoria -> {
            categoria.setNombre(categoriaDetalles.getNombre());
            Categoria categoriaActualizada = categoriaRepository.save(categoria);
            return ResponseEntity.ok(categoriaActualizada);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 4. Eliminar una categoría
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCategoria(@PathVariable Long id) {
        if (categoriaRepository.existsById(id)) {
            categoriaRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
