package cl.maotech.tenantpayment.service;

import cl.maotech.tenantpayment.dto.TenantRequest;
import cl.maotech.tenantpayment.dto.TenantResponse;
import cl.maotech.tenantpayment.entity.PersonType;
import cl.maotech.tenantpayment.entity.Tenant;
import cl.maotech.tenantpayment.repository.PersonTypeRepository;
import cl.maotech.tenantpayment.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository repository;
    private final PersonTypeRepository personTypeRepository;

    @Transactional(readOnly = true)
    public List<TenantResponse> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TenantResponse create(TenantRequest request) {
        PersonType tipo = personTypeRepository.findById(request.getTipoPersonaId())
                .orElseThrow(() -> new EntityNotFoundException("PersonType not found: " + request.getTipoPersonaId()));

        Tenant tenant = new Tenant();
        tenant.setNumrun(request.getNumrun());
        tenant.setDvrun(request.getDvrun());
        tenant.setPrimerNombre(request.getPrimerNombre());
        tenant.setSegundoNombre(request.getSegundoNombre());
        tenant.setApellidoPaterno(request.getApellidoPaterno());
        tenant.setApellidoMaterno(request.getApellidoMaterno());
        tenant.setTipoPersona(tipo);

        Tenant saved = repository.save(tenant);
        return toResponse(saved);
    }

    private TenantResponse toResponse(Tenant t) {
        TenantResponse r = new TenantResponse();
        r.setNumrun(t.getNumrun());
        r.setDvrun(t.getDvrun());
        r.setPrimerNombre(t.getPrimerNombre());
        r.setSegundoNombre(t.getSegundoNombre());
        r.setApellidoPaterno(t.getApellidoPaterno());
        r.setApellidoMaterno(t.getApellidoMaterno());
        if (t.getTipoPersona() != null) {
            r.setTipoPersona(t.getTipoPersona().getDescripcionTipoPersona());
        }
        return r;
    }
}