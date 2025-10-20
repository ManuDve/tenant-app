package cl.maotech.tenantpayment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "AUDITORIA_MOROSIDADES")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaMorosidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria")
    private Long idAuditoria;

    @Column(name = "id_morosidad")
    private Long idMorosidad;

    @Column(name = "numrun_rpgc")
    private Long numrunRpgc;

    @Column(name = "monto_moroso_anterior")
    private BigDecimal montoMorosoAnterior;

    @Column(name = "monto_moroso_nuevo")
    private BigDecimal montoMorosoNuevo;

    @Column(name = "fecha_auditoria")
    private LocalDate fechaAuditoria;
}

