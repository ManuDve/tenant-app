package cl.maotech.tenantpayment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "RESPONSABLE_PAGO_GASTO_COMUN")
public class Tenant {

    @Id
    @Column(name = "NUMRUN_RPGC")
    private Long numrun;

    @Column(name = "DVRUN_RPGC")
    private String dvrun;

    @Column(name = "PNOMBRE_RPGC")
    private String primerNombre;

    @Column(name = "SNOMBRE_RPGC")
    private String segundoNombre;

    @Column(name = "APPATERNO_RPGC")
    private String apellidoPaterno;

    @Column(name = "APMATERNO_RPGC")
    private String apellidoMaterno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_TPER")
    private PersonType tipoPersona;
}