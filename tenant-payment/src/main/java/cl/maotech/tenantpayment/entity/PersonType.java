package cl.maotech.tenantpayment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "TIPO_PERSONA")
public class PersonType {
    @Id
    @Column(name = "ID_TPER")
    private Integer idTipoPersona;
    @Column(name = "DESCRIPCION_TPER")
    private String descripcionTipoPersona;
}
