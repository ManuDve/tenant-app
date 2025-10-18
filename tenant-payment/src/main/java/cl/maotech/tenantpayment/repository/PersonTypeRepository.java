package cl.maotech.tenantpayment.repository;

import cl.maotech.tenantpayment.entity.PersonType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonTypeRepository extends JpaRepository<PersonType, Integer> {
}

