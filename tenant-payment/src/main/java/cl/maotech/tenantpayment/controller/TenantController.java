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
@CrossOrigin(
    origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS},
    allowedHeaders = "*",
    allowCredentials = "true",
    maxAge = 3600
)
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