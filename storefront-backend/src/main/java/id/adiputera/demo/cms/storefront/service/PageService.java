package id.adiputera.demo.cms.storefront.service;

import id.adiputera.demo.cms.dto.PageDTO;
import id.adiputera.demo.cms.entity.CatalogVersion;
import id.adiputera.demo.cms.entity.Page;
import id.adiputera.demo.cms.mapper.EntityMapper;
import id.adiputera.demo.cms.storefront.exception.ResourceNotFoundException;
import id.adiputera.demo.cms.storefront.repository.PageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Page Service class.
 *
 * @author Yusuf F. Adiputera
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PageService {

    private final PageRepository pageRepository;
    private final EntityMapper entityMapper;

    /**
     * Retrieves a page DTO by its slug.
     *
     * @param slug The slug of the page to retrieve.
     * @param isEdit True if fetching for live edit (staged catalog).
     * @return The mapped PageDTO.
     */
    @Cacheable(value = "pages", key = "#slug", condition = "!#isEdit")
    @Transactional(readOnly = true)
    public PageDTO getPageBySlug(String slug, boolean isEdit) {
        log.debug("Fetching page with slug: {}, edit: {}", slug, isEdit);

        CatalogVersion version = isEdit ? CatalogVersion.STAGED : CatalogVersion.ONLINE;

        Page page = pageRepository.findBySlugWithRelations(slug, version)
                .orElseThrow(() -> new ResourceNotFoundException("Page", slug));

        return entityMapper.toPageDTO(page, true);
    }
}
