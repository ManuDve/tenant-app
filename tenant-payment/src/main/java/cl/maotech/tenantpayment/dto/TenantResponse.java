package cl.maotech.tenantpayment.dto;

import lombok.Data;

@Data
public class TenantResponse {
    private Long numrun;
    private String dvrun;
    private String primerNombre;
    private String segundoNombre;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String tipoPersona;
}
