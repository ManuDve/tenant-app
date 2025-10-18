package cl.maotech.tenantpayment.controller;

import cl.maotech.tenantpayment.dto.TenantRequest;
import cl.maotech.tenantpayment.dto.TenantResponse;
import cl.maotech.tenantpayment.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService service;

    @GetMapping
    public List<TenantResponse> findAll() {
        return service.findAll();
    }

    @PostMapping
    public TenantResponse create(@RequestBody TenantRequest request) {
        return service.create(request);
    }
}