package org.example.testingappback.controllers;

import org.example.testingappback.entities.Utilisateur;
import org.example.testingappback.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/utilisateurs")
@CrossOrigin(origins = "http://localhost:4200")  // Ajoutez cette ligne
public class UtilisateurController {

    @Autowired
    private UtilisateurService userService;

    @GetMapping
    public List<Utilisateur> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public Optional<Utilisateur> getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @PostMapping
    public Utilisateur createUser(@RequestBody Utilisateur user) {
        return userService.createUser(user);
    }

    @PutMapping("/{id}")
    public Utilisateur updateUser(@PathVariable Long id, @RequestBody Utilisateur userDetails) {
        return userService.updateUser(id, userDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}
