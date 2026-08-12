package id.adiputera.demo.cms.admin.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import id.adiputera.demo.cms.admin.dto.ComponentSchema;
import id.adiputera.demo.cms.admin.dto.ComponentTypeInfo;
import id.adiputera.demo.cms.admin.dto.CreateBannerComponentRequest;
import id.adiputera.demo.cms.admin.dto.CreateComponentRequest;
import id.adiputera.demo.cms.admin.dto.CreateLatestArticleComponentRequest;
import id.adiputera.demo.cms.admin.dto.CreateLatestEventComponentRequest;
import id.adiputera.demo.cms.admin.dto.CreateNavigationComponentRequest;
import id.adiputera.demo.cms.admin.dto.CreateParagraphComponentRequest;
import id.adiputera.demo.cms.admin.dto.CreateProductCarouselComponentRequest;
import id.adiputera.demo.cms.admin.dto.CreateProductDetailComponentRequest;
import id.adiputera.demo.cms.admin.dto.CreateQuickMenuComponentRequest;
import id.adiputera.demo.cms.admin.dto.CreateQuoteOfTheDayComponentRequest;
import id.adiputera.demo.cms.admin.dto.CreateTopEventComponentRequest;
import id.adiputera.demo.cms.admin.dto.CreateTrendingArticleComponentRequest;
import id.adiputera.demo.cms.admin.dto.ReorderComponentRequest;
import id.adiputera.demo.cms.admin.exception.BadRequestException;
import id.adiputera.demo.cms.admin.exception.ResourceNotFoundException;
import id.adiputera.demo.cms.admin.repository.CatalogRepository;
import id.adiputera.demo.cms.admin.repository.ComponentRepository;
import id.adiputera.demo.cms.admin.repository.SlotRepository;
import id.adiputera.demo.cms.dto.ComponentDTO;
import id.adiputera.demo.cms.entity.Catalog;
import id.adiputera.demo.cms.entity.CatalogVersion;
import id.adiputera.demo.cms.entity.Component;
import id.adiputera.demo.cms.entity.Slot;
import id.adiputera.demo.cms.entity.component.BannerComponent;
import id.adiputera.demo.cms.entity.component.LatestArticleComponent;
import id.adiputera.demo.cms.entity.component.LatestEventComponent;
import id.adiputera.demo.cms.entity.component.NavigationComponent;
import id.adiputera.demo.cms.entity.component.ParagraphComponent;
import id.adiputera.demo.cms.entity.component.ProductCarouselComponent;
import id.adiputera.demo.cms.entity.component.ProductDetailComponent;
import id.adiputera.demo.cms.entity.component.QuickMenuComponent;
import id.adiputera.demo.cms.entity.component.QuoteOfTheDayComponent;
import id.adiputera.demo.cms.entity.component.TopEventComponent;
import id.adiputera.demo.cms.entity.component.TrendingArticleComponent;
import id.adiputera.demo.cms.mapper.EntityMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service handling transactional business logic for CMS components.
 *
 * @author Yusuf F. Adiputera
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ComponentManagementService {

    private final ComponentRepository componentRepository;
    private final SlotRepository slotRepository;
    private final CatalogRepository catalogRepository;
    private final EntityMapper entityMapper;
    private final ObjectMapper objectMapper;
    private final ComponentSchemaService componentSchemaService;
    private final CatalogSyncService catalogSyncService;

    /**
     * Retrieves or creates the STAGED catalog entity.
     *
     * @return The STAGED catalog.
     */
    private Catalog getStagedCatalog() {
        return catalogRepository.findByCatalogIdAndVersion("contentCatalog", CatalogVersion.STAGED)
            .orElseGet(() -> {
                Catalog cat = new Catalog();
                cat.setCatalogId("contentCatalog");
                cat.setVersion(CatalogVersion.STAGED);
                return catalogRepository.save(cat);
            });
    }

    /**
     * Retrieves all components with their synchronization status.
     *
     * @return A list of component DTOs.
     */
    @Transactional(readOnly = true)
    public List<ComponentDTO> getAllComponents() {
        List<Component> components = componentRepository.findAll();
        Map<String, String> syncStatusMap = catalogSyncService.calculateSyncStatus(components, Component.class);
        
        return components.stream().map(c -> {
            ComponentDTO dto = entityMapper.toComponentDTO(c);
            if (dto != null) {
                dto.setSyncStatus(syncStatusMap.getOrDefault(c.getSyncKey(), "UNKNOWN"));
            }
            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * Creates a new component assigned to a slot.
     *
     * @param request The component creation request.
     * @return The created component DTO.
     */
    @Transactional
    public ComponentDTO createComponent(CreateComponentRequest request) {
        if (request.getSlotId() == null) {
            throw new BadRequestException("Slot ID is required to create a component");
        }
        Slot slot = slotRepository.findById(request.getSlotId())
            .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + request.getSlotId()));

        Component component = createComponentFromRequest(request);
        Component savedComponent = componentRepository.save(component);
        
        int index = request.getSortOrder() != null ? request.getSortOrder() : slot.getComponents().size();
        if (index > slot.getComponents().size()) index = slot.getComponents().size();
        slot.getComponents().add(index, savedComponent);
        slotRepository.save(slot);
        
        Map<String, String> syncStatusMap = catalogSyncService.calculateSyncStatus(List.of(savedComponent), Component.class);
        ComponentDTO dto = entityMapper.toComponentDTO(savedComponent);
        if (dto != null) {
            dto.setSyncStatus(syncStatusMap.getOrDefault(savedComponent.getSyncKey(), "UNKNOWN"));
        }
        return dto;
    }

    /**
     * Links an existing component to a slot at the specified sort order.
     *
     * @param slotId The ID of the slot.
     * @param componentId The ID of the component to link.
     * @param payload Map containing optional sortOrder.
     */
    @Transactional
    public void linkComponent(Long slotId, Long componentId, Map<String, Integer> payload) {
        Slot slot = slotRepository.findById(slotId)
            .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + slotId));
        Component component = componentRepository.findById(componentId)
            .orElseThrow(() -> new ResourceNotFoundException("Component not found with id: " + componentId));
            
        Integer sortOrder = payload != null ? payload.get("sortOrder") : null;
        int index = sortOrder != null ? sortOrder : slot.getComponents().size();
        if (index > slot.getComponents().size()) index = slot.getComponents().size();
        
        if (!slot.getComponents().contains(component)) {
            slot.getComponents().add(index, component);
            slotRepository.save(slot);
        }
    }

    /**
     * Updates an existing component.
     *
     * @param id The ID of the component to update.
     * @param request The update request data.
     * @return The updated component DTO.
     */
    @Transactional
    public ComponentDTO updateComponent(Long id, CreateComponentRequest request) {
        Component existing = componentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Component not found with id: " + id));

        if (!existing.getType().name().equals(request.getType())) {
            throw new BadRequestException("Cannot change component type");
        }

        updateComponentFromRequest(existing, request);
        Component updated = componentRepository.save(existing);
        
        Map<String, String> syncStatusMap = catalogSyncService.calculateSyncStatus(List.of(updated), Component.class);
        ComponentDTO dto = entityMapper.toComponentDTO(updated);
        if (dto != null) {
            dto.setSyncStatus(syncStatusMap.getOrDefault(updated.getSyncKey(), "UNKNOWN"));
        }
        return dto;
    }

    /**
     * Reorders a component inside a specific slot.
     *
     * @param slotId The ID of the slot.
     * @param id The ID of the component to reorder.
     * @param request The reorder request containing the new sort order.
     */
    @Transactional
    public void reorderComponent(Long slotId, Long id, ReorderComponentRequest request) {
        Slot slot = slotRepository.findById(slotId)
            .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + slotId));
        Component component = componentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Component not found with id: " + id));

        List<Component> currentComponents = new ArrayList<>(slot.getComponents());
        if (currentComponents.remove(component)) {
            int newIndex = request.getSortOrder();
            if (newIndex > currentComponents.size()) newIndex = currentComponents.size();
            currentComponents.add(newIndex, component);
            
            slot.getComponents().clear();
            slotRepository.flush();
            slot.getComponents().addAll(currentComponents);
            slotRepository.save(slot);
        }
    }

    /**
     * Removes a component from a specific slot without deleting the component itself.
     *
     * @param slotId The ID of the slot.
     * @param id The ID of the component to remove.
     */
    @Transactional
    public void removeComponentFromSlot(Long slotId, Long id) {
        Slot slot = slotRepository.findById(slotId)
            .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + slotId));
        Component component = componentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Component not found with id: " + id));
            
        if (slot.getComponents().remove(component)) {
            slotRepository.save(slot);
        }
    }

    /**
     * Deletes a component permanently by its ID.
     *
     * @param id The ID of the component to delete.
     */
    @Transactional
    public void deleteComponent(Long id) {
        if (!componentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Component not found with id: " + id);
        }
        componentRepository.deleteById(id);
    }

    /**
     * Retrieves available component types.
     *
     * @return List of component type metadata.
     */
    @Transactional(readOnly = true)
    public List<ComponentTypeInfo> getComponentTypes() {
        return componentSchemaService.getComponentTypes();
    }

    /**
     * Retrieves the schema for a specific component type.
     *
     * @param type The component type string.
     * @return The component schema definition.
     */
    @Transactional(readOnly = true)
    public ComponentSchema getComponentSchema(String type) {
        return componentSchemaService.getComponentSchema(type);
    }

    /**
     * Instantiates and populates a new Component entity from the creation request.
     *
     * @param request The creation request.
     * @return The constructed component entity.
     */
    private Component createComponentFromRequest(CreateComponentRequest request) {
        Component component;
        
        switch (request.getType()) {
            case "BANNER":
                component = createBannerComponent(request);
                break;
            case "PARAGRAPH":
                component = createParagraphComponent(request);
                break;
            case "PRODUCT_CAROUSEL":
                component = createProductCarouselComponent(request);
                break;
            case "NAVIGATION":
                component = createNavigationComponent(request);
                break;
            case "QUICK_MENU":
                component = createQuickMenuComponent(request);
                break;
            case "PRODUCT_DETAIL":
                component = createProductDetailComponent(request);
                break;
            case "LATEST_ARTICLE":
                component = createLatestArticleComponent(request);
                break;
            case "TRENDING_ARTICLE":
                component = createTrendingArticleComponent(request);
                break;
            case "LATEST_EVENT":
                component = createLatestEventComponent(request);
                break;
            case "TOP_EVENT":
                component = createTopEventComponent(request);
                break;
            case "QUOTE_OF_THE_DAY":
                component = createQuoteOfTheDayComponent(request);
                break;
            default:
                throw new BadRequestException("Unknown component type: " + request.getType());
        }
        
        component.setUid(request.getUid());
        component.setName(request.getName());
        component.setType(request.getType());
        component.setCatalog(getStagedCatalog());
        
        return component;
    }

    /**
     * Updates fields on an existing component from the update request.
     *
     * @param existing The existing component entity.
     * @param request The update request data.
     */
    private void updateComponentFromRequest(Component existing, CreateComponentRequest request) {
        existing.setUid(request.getUid());
        existing.setName(request.getName());
        
        if (existing instanceof BannerComponent banner && request instanceof CreateBannerComponentRequest req) {
            updateBannerComponent(banner, req);
        } else if (existing instanceof ParagraphComponent paragraph && request instanceof CreateParagraphComponentRequest req) {
            updateParagraphComponent(paragraph, req);
        } else if (existing instanceof ProductCarouselComponent carousel && request instanceof CreateProductCarouselComponentRequest req) {
            updateProductCarouselComponent(carousel, req);
        } else if (existing instanceof NavigationComponent nav && request instanceof CreateNavigationComponentRequest req) {
            updateNavigationComponent(nav, req);
        } else if (existing instanceof QuickMenuComponent menu && request instanceof CreateQuickMenuComponentRequest req) {
            updateQuickMenuComponent(menu, req);
        } else if (existing instanceof ProductDetailComponent detail && request instanceof CreateProductDetailComponentRequest req) {
            updateProductDetailComponent(detail, req);
        } else if (existing instanceof LatestArticleComponent latestArticle) {
            updateLatestArticleComponent(latestArticle, request);
        } else if (existing instanceof LatestEventComponent latestEvent) {
            updateLatestEventComponent(latestEvent, request);
        } else if (existing instanceof TrendingArticleComponent trendingArticle && request instanceof CreateTrendingArticleComponentRequest req) {
            updateTrendingArticleComponent(trendingArticle, req);
        } else if (existing instanceof TopEventComponent topEvent && request instanceof CreateTopEventComponentRequest req) {
            updateTopEventComponent(topEvent, req);
        } else if (existing instanceof QuoteOfTheDayComponent quoteComp && request instanceof CreateQuoteOfTheDayComponentRequest req) {
            updateQuoteOfTheDayComponent(quoteComp, req);
        }
    }

    /**
     * Creates a banner component instance.
     *
     * @param request The component request.
     * @return The banner component.
     */
    private BannerComponent createBannerComponent(CreateComponentRequest request) {
        CreateBannerComponentRequest req = (CreateBannerComponentRequest) request;
        BannerComponent banner = new BannerComponent();
        banner.setImageUrl(req.getImageUrl());
        banner.setAltText(req.getAltText());
        banner.setTitle(req.getTitle());
        banner.setSubtitle(req.getSubtitle());
        banner.setCtaText(req.getCtaText());
        banner.setCtaUrl(req.getCtaUrl());
        return banner;
    }

    /**
     * Updates banner component properties.
     *
     * @param banner The banner component to update.
     * @param req The banner request data.
     */
    private void updateBannerComponent(BannerComponent banner, CreateBannerComponentRequest req) {
        banner.setImageUrl(req.getImageUrl());
        banner.setAltText(req.getAltText());
        banner.setTitle(req.getTitle());
        banner.setSubtitle(req.getSubtitle());
        banner.setCtaText(req.getCtaText());
        banner.setCtaUrl(req.getCtaUrl());
    }

    /**
     * Creates a paragraph component instance.
     *
     * @param request The component request.
     * @return The paragraph component.
     */
    private ParagraphComponent createParagraphComponent(CreateComponentRequest request) {
        CreateParagraphComponentRequest req = (CreateParagraphComponentRequest) request;
        ParagraphComponent paragraph = new ParagraphComponent();
        paragraph.setTitle(req.getTitle());
        paragraph.setContent(req.getContent());
        return paragraph;
    }

    /**
     * Updates paragraph component properties.
     *
     * @param paragraph The paragraph component to update.
     * @param req The paragraph request data.
     */
    private void updateParagraphComponent(ParagraphComponent paragraph, CreateParagraphComponentRequest req) {
        paragraph.setTitle(req.getTitle());
        paragraph.setContent(req.getContent());
    }

    /**
     * Creates a product carousel component instance.
     *
     * @param request The component request.
     * @return The product carousel component.
     */
    private ProductCarouselComponent createProductCarouselComponent(CreateComponentRequest request) {
        CreateProductCarouselComponentRequest req = (CreateProductCarouselComponentRequest) request;
        ProductCarouselComponent carousel = new ProductCarouselComponent();
        carousel.setTitle(req.getTitle());
        if (req.getProductCodes() != null) {
            carousel.setProductCodes(String.join(",", req.getProductCodes()));
        }
        return carousel;
    }

    /**
     * Updates product carousel component properties.
     *
     * @param carousel The product carousel component to update.
     * @param req The product carousel request data.
     */
    private void updateProductCarouselComponent(ProductCarouselComponent carousel, CreateProductCarouselComponentRequest req) {
        carousel.setTitle(req.getTitle());
        if (req.getProductCodes() != null) {
            carousel.setProductCodes(String.join(",", req.getProductCodes()));
        }
    }

    /**
     * Creates a navigation component instance.
     *
     * @param request The component request.
     * @return The navigation component.
     */
    private NavigationComponent createNavigationComponent(CreateComponentRequest request) {
        CreateNavigationComponentRequest req = (CreateNavigationComponentRequest) request;
        NavigationComponent nav = new NavigationComponent();
        nav.setDisplayText(req.getDisplayText());
        nav.setUrl(req.getUrl());
        nav.setIcon(req.getIcon());
        return nav;
    }

    /**
     * Updates navigation component properties.
     *
     * @param nav The navigation component to update.
     * @param req The navigation request data.
     */
    private void updateNavigationComponent(NavigationComponent nav, CreateNavigationComponentRequest req) {
        nav.setDisplayText(req.getDisplayText());
        nav.setUrl(req.getUrl());
        nav.setIcon(req.getIcon());
    }

    /**
     * Creates a quick menu component instance.
     *
     * @param request The component request.
     * @return The quick menu component.
     */
    private QuickMenuComponent createQuickMenuComponent(CreateComponentRequest request) {
        CreateQuickMenuComponentRequest req = (CreateQuickMenuComponentRequest) request;
        QuickMenuComponent menu = new QuickMenuComponent();
        menu.setTitle(req.getTitle());
        menu.setImageUrl(req.getImageUrl());
        menu.setUrl(req.getUrl());
        return menu;
    }

    /**
     * Updates quick menu component properties.
     *
     * @param menu The quick menu component to update.
     * @param req The quick menu request data.
     */
    private void updateQuickMenuComponent(QuickMenuComponent menu, CreateQuickMenuComponentRequest req) {
        menu.setTitle(req.getTitle());
        menu.setImageUrl(req.getImageUrl());
        menu.setUrl(req.getUrl());
    }

    /**
     * Creates a product detail component instance.
     *
     * @param request The component request.
     * @return The product detail component.
     */
    private ProductDetailComponent createProductDetailComponent(CreateComponentRequest request) {
        CreateProductDetailComponentRequest req = (CreateProductDetailComponentRequest) request;
        ProductDetailComponent detail = new ProductDetailComponent();
        detail.setTitle(req.getTitle());
        detail.setShowPrice(req.getShowPrice() != null ? req.getShowPrice() : true);
        detail.setShowDescription(req.getShowDescription() != null ? req.getShowDescription() : true);
        return detail;
    }

    /**
     * Updates product detail component properties.
     *
     * @param detail The product detail component to update.
     * @param req The product detail request data.
     */
    private void updateProductDetailComponent(ProductDetailComponent detail, CreateProductDetailComponentRequest req) {
        detail.setTitle(req.getTitle());
        detail.setShowPrice(req.getShowPrice() != null ? req.getShowPrice() : true);
        detail.setShowDescription(req.getShowDescription() != null ? req.getShowDescription() : true);
    }

    /**
     * Creates a latest article component instance.
     *
     * @param request The component request.
     * @return The latest article component.
     */
    private LatestArticleComponent createLatestArticleComponent(CreateComponentRequest request) {
        CreateLatestArticleComponentRequest req = objectMapper.convertValue(request, CreateLatestArticleComponentRequest.class);
        return LatestArticleComponent.builder()
                .title(req.getTitle())
                .articleCount(req.getArticleCount())
                .build();
    }

    /**
     * Updates latest article component properties.
     *
     * @param component The latest article component to update.
     * @param request The latest article request data.
     */
    private void updateLatestArticleComponent(LatestArticleComponent component, CreateComponentRequest request) {
        CreateLatestArticleComponentRequest req = objectMapper.convertValue(request, CreateLatestArticleComponentRequest.class);
        if (req.getTitle() != null) component.setTitle(req.getTitle());
        if (req.getArticleCount() != null) component.setArticleCount(req.getArticleCount());
    }

    /**
     * Creates a latest event component instance.
     *
     * @param request The component request.
     * @return The latest event component.
     */
    private LatestEventComponent createLatestEventComponent(CreateComponentRequest request) {
        CreateLatestEventComponentRequest req = objectMapper.convertValue(request, CreateLatestEventComponentRequest.class);
        LatestEventComponent component = new LatestEventComponent();
        component.setTitle(req.getTitle());
        if (req.getEventSlugs() != null) {
            component.setEventSlugs(String.join(",", req.getEventSlugs()));
        }
        return component;
    }

    /**
     * Updates latest event component properties.
     *
     * @param component The latest event component to update.
     * @param request The latest event request data.
     */
    private void updateLatestEventComponent(LatestEventComponent component, CreateComponentRequest request) {
        CreateLatestEventComponentRequest req = objectMapper.convertValue(request, CreateLatestEventComponentRequest.class);
        if (req.getTitle() != null) component.setTitle(req.getTitle());
        if (req.getEventSlugs() != null) {
            component.setEventSlugs(String.join(",", req.getEventSlugs()));
        } else {
            component.setEventSlugs(null);
        }
    }

    /**
     * Creates a trending article component instance.
     *
     * @param request The component request.
     * @return The trending article component.
     */
    private TrendingArticleComponent createTrendingArticleComponent(CreateComponentRequest request) {
        CreateTrendingArticleComponentRequest req = (CreateTrendingArticleComponentRequest) request;
        TrendingArticleComponent trending = new TrendingArticleComponent();
        trending.setTitle(req.getTitle());
        if (req.getArticleSlugs() != null) {
            trending.setArticleSlugs(String.join(",", req.getArticleSlugs()));
        }
        return trending;
    }

    /**
     * Updates trending article component properties.
     *
     * @param trending The trending article component to update.
     * @param req The trending article request data.
     */
    private void updateTrendingArticleComponent(TrendingArticleComponent trending, CreateTrendingArticleComponentRequest req) {
        trending.setTitle(req.getTitle());
        if (req.getArticleSlugs() != null) {
            trending.setArticleSlugs(String.join(",", req.getArticleSlugs()));
        } else {
            trending.setArticleSlugs(null);
        }
    }

    /**
     * Creates a top event component instance.
     *
     * @param request The component request.
     * @return The top event component.
     */
    private TopEventComponent createTopEventComponent(CreateComponentRequest request) {
        CreateTopEventComponentRequest req = (CreateTopEventComponentRequest) request;
        TopEventComponent topEvent = new TopEventComponent();
        topEvent.setTitle(req.getTitle());
        topEvent.setEventSlug(req.getEventSlug());
        return topEvent;
    }

    /**
     * Updates top event component properties.
     *
     * @param topEvent The top event component to update.
     * @param req The top event request data.
     */
    private void updateTopEventComponent(TopEventComponent topEvent, CreateTopEventComponentRequest req) {
        topEvent.setTitle(req.getTitle());
        topEvent.setEventSlug(req.getEventSlug());
    }

    private QuoteOfTheDayComponent createQuoteOfTheDayComponent(CreateComponentRequest request) {
        CreateQuoteOfTheDayComponentRequest req = (CreateQuoteOfTheDayComponentRequest) request;
        QuoteOfTheDayComponent component = new QuoteOfTheDayComponent();
        component.setTitle(req.getTitle());
        component.setQuote(req.getQuote());
        return component;
    }

    private void updateQuoteOfTheDayComponent(QuoteOfTheDayComponent component, CreateQuoteOfTheDayComponentRequest req) {
        if (req.getTitle() != null) component.setTitle(req.getTitle());
        if (req.getQuote() != null) component.setQuote(req.getQuote());
    }
}
