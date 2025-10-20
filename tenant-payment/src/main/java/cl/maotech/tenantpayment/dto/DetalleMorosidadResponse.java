package cl.maotech.tenantpayment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleMorosidadResponse {
    private Long idMorosidad;
    private Long numrun;
    private String dvrun;
    private String nombreCompleto;
    private BigDecimal montoTotalMoroso;
    private LocalDate fechaUltimaActualizacion;
}

