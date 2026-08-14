package id.adiputera.demo.cms.storefront.repository;

import id.adiputera.demo.cms.entity.CatalogVersion;
import id.adiputera.demo.cms.entity.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Page Repository interface.
 *
 * @author Yusuf F. Adiputera
 */
@Repository
public interface PageRepository extends JpaRepository<Page, Long> {

    @Query("SELECT p FROM Page p " +
           "LEFT JOIN FETCH p.breadcrumbs " +
           "LEFT JOIN FETCH p.slots " +
           "WHERE p.slug = :slug AND p.catalog.version = :catalogVersion AND p.catalog.catalogId = 'contentCatalog'")
    Optional<Page> findBySlugWithRelations(@Param("slug") String slug, @Param("catalogVersion") CatalogVersion catalogVersion);

    @Query("SELECT p FROM Page p WHERE p.slug = :slug AND p.catalog.version = :catalogVersion AND p.catalog.catalogId = 'contentCatalog'")
    Optional<Page> findBySlug(@Param("slug") String slug, @Param("catalogVersion") CatalogVersion catalogVersion);
}
