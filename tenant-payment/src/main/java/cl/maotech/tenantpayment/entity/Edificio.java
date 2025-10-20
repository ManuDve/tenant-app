package cl.maotech.tenantpayment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "EDIFICIO")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Edificio {

    @Id
    @Column(name = "id_edif")
    private Long idEdif;

    @Column(name = "nombre_edif")
    private String nombreEdif;

    @Column(name = "direccion_edif")
    private String direccionEdif;

    @Column(name = "id_comuna")
    private Long idComuna;
}

