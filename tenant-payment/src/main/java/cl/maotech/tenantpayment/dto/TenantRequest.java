package cl.maotech.tenantpayment.dto;

import lombok.Data;

@Data
public class TenantRequest {
    private Long numrun;
    private String dvrun;
    private String primerNombre;
    private String segundoNombre;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private Integer tipoPersonaId;
}

