package cl.maotech.tenantpayment.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "DETALLE_MOROSIDAD")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleMorosidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_morosidad")
    private Long idMorosidad;

    @Column(name = "numrun_rpgc")
    private Long numrunRpgc;

    @Column(name = "monto_total_moroso")
    private BigDecimal montoTotalMoroso;

    @Column(name = "fecha_ultima_actualizacion")
    private LocalDate fechaUltimaActualizacion;
}

