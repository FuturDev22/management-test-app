package org.example.testingappback.services;


import org.example.testingappback.entities.Utilisateur;
import org.example.testingappback.repositories.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UtilisateurService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    public List<Utilisateur> getAllUsers() {
        return utilisateurRepository.findAll();
    }

    public Optional<Utilisateur> getUserById(Long id) {
        return utilisateurRepository.findById(id);
    }

    public Utilisateur createUser(Utilisateur user) {
        return utilisateurRepository.save(user);
    }

    public Utilisateur updateUser(Long id, Utilisateur userDetails) {
        Utilisateur user = utilisateurRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(userDetails.getName());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());

        return utilisateurRepository.save(user);
    }

    public void deleteUser(Long id) {
        utilisateurRepository.deleteById(id);
    }
}
