package cl.maotech.tenantpayment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EdificioResponse {
    private Long idEdif;
    private String nombreEdif;
    private String direccionEdif;
    private BigDecimal promedioMorosidad;
}

