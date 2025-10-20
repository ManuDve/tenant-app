package cl.maotech.tenantpayment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "AUDITORIA_PAGOS")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaPago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria")
    private Long idAuditoria;

    @Column(name = "anno_mes_pcgc")
    private Integer annoMesPcgc;

    @Column(name = "id_edif")
    private Long idEdif;

    @Column(name = "nro_depto")
    private Long nroDepto;

    @Column(name = "monto_cancelado")
    private BigDecimal montoCancelado;

    @Column(name = "fecha_auditoria")
    private LocalDate fechaAuditoria;

    @Column(name = "operacion")
    private String operacion;
}
