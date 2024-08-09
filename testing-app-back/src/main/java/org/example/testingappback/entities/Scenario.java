package org.example.testingappback.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Scenario implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String jobScript;
    private String jobPath;

    @ManyToOne
    @JoinColumn(name = "module_id")
    @JsonBackReference
    private Module module;
}
