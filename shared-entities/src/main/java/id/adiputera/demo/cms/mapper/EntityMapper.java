package id.adiputera.demo.cms.mapper;

import id.adiputera.demo.cms.dto.BannerComponentDTO;
import id.adiputera.demo.cms.dto.BreadcrumbDTO;
import id.adiputera.demo.cms.dto.ComponentDTO;
import id.adiputera.demo.cms.dto.LatestArticleComponentDTO;
import id.adiputera.demo.cms.dto.LatestEventComponentDTO;
import id.adiputera.demo.cms.dto.NavigationComponentDTO;
import id.adiputera.demo.cms.dto.PageDTO;
import id.adiputera.demo.cms.dto.ParagraphComponentDTO;
import id.adiputera.demo.cms.dto.ProductCarouselComponentDTO;
import id.adiputera.demo.cms.dto.ProductDTO;
import id.adiputera.demo.cms.dto.ProductDetailComponentDTO;
import id.adiputera.demo.cms.dto.QuickMenuComponentDTO;
import id.adiputera.demo.cms.dto.QuoteOfTheDayComponentDTO;
import id.adiputera.demo.cms.dto.SlotDTO;
import id.adiputera.demo.cms.dto.TopEventComponentDTO;
import id.adiputera.demo.cms.dto.TrendingArticleComponentDTO;
import id.adiputera.demo.cms.entity.ComponentType;
import id.adiputera.demo.cms.entity.Page;
import id.adiputera.demo.cms.entity.Product;
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
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Entity Mapper class.
 *
 * @author Yusuf F. Adiputera
 */
@Component
public class EntityMapper {

    /**
     * Maps a Page entity to its DTO, optionally including slot summaries.
     *
     * @param page The Page entity to map.
     * @param includeSlots Whether to include slot metadata in the response.
     * @return The mapped PageDTO, or null if the input page is null.
     */
    public PageDTO toPageDTO(Page page, boolean includeSlots) {
        if (page == null) {
            return null;
        }

        PageDTO.PageDTOBuilder builder = PageDTO.builder()
                .id(page.getId())
                .slug(page.getSlug())
                .title(page.getTitle())
                .breadcrumbTitle(page.getBreadcrumbTitle())
                .metaTitle(page.getMetaTitle())
                .metaDescription(page.getMetaDescription())
                .metaKeywords(page.getMetaKeywords())
                .canonicalUrl(page.getCanonicalUrl())
                .robotsIndex(page.getRobotsIndex())
                .robotsFollow(page.getRobotsFollow())
                .ogTitle(page.getOgTitle())
                .ogDescription(page.getOgDescription())
                .ogImage(page.getOgImage());

        // Map breadcrumbs
        if (page.getBreadcrumbs() != null) {
            List<BreadcrumbDTO> breadcrumbs = page.getBreadcrumbs().stream()
                    .filter(java.util.Objects::nonNull)
                    .map(this::toBreadcrumbDTO)
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList());
            builder.breadcrumbs(breadcrumbs);
        }

        // Map slots (metadata only, no components)
        if (includeSlots && page.getSlots() != null) {
            List<SlotDTO> slots = page.getSlots().stream()
                    .filter(java.util.Objects::nonNull)
                    .map(slot -> SlotDTO.builder()
                            .id(slot.getId())
                            .code(slot.getCode())
                            .name(slot.getName())
                            .build())
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList());
            builder.slots(slots);
        }

        return builder.build();
    }

    /**
     * Maps a Page entity to a BreadcrumbDTO.
     *
     * @param page The Page entity to map.
     * @return The mapped BreadcrumbDTO, or null if the input page is null.
     */
    public BreadcrumbDTO toBreadcrumbDTO(Page page) {
        if (page == null) {
            return null;
        }

        return BreadcrumbDTO.builder()
                .slug(page.getSlug())
                .breadcrumbTitle(page.getBreadcrumbTitle())
                .build();
    }

    /**
     * Maps a Slot entity along with all its associated components to a SlotDTO.
     *
     * @param slot The Slot entity to map.
     * @return The mapped SlotDTO containing component list, or null if input slot is null.
     */
    public SlotDTO toSlotDTOWithComponents(Slot slot) {
        if (slot == null) {
            return null;
        }

        List<ComponentDTO> components = new java.util.ArrayList<>();
        if (slot.getComponents() != null) {
            int sortOrder = 0;
            for (id.adiputera.demo.cms.entity.Component component : slot.getComponents()) {
                if (component == null) {
                    continue;
                }
                ComponentDTO dto = toComponentDTO(component);
                if (dto != null) {
                    dto.setSortOrder(sortOrder++);
                    components.add(dto);
                }
            }
        }

        return SlotDTO.builder()
                .id(slot.getId())
                .code(slot.getCode())
                .name(slot.getName())
                .components(components)
                .build();
    }

    /**
     * Polymorphic method to map a Component entity to its specific ComponentDTO subtype.
     *
     * @param component The Component entity to map.
     * @return The mapped ComponentDTO subtype, or null if input component is null.
     */
    public ComponentDTO toComponentDTO(id.adiputera.demo.cms.entity.Component component) {
        if (component == null) {
            return null;
        }

        ComponentType type = component.getType();

        return switch (type) {
            case PARAGRAPH -> toParagraphComponentDTO((ParagraphComponent) component);
            case BANNER -> toBannerComponentDTO((BannerComponent) component);
            case PRODUCT_CAROUSEL -> toProductCarouselComponentDTO((ProductCarouselComponent) component);
            case NAVIGATION -> toNavigationComponentDTO((NavigationComponent) component);
            case QUICK_MENU -> toQuickMenuComponentDTO((QuickMenuComponent) component);
            case PRODUCT_DETAIL -> toProductDetailComponentDTO((ProductDetailComponent) component);
            case LATEST_ARTICLE -> toLatestArticleComponentDTO((LatestArticleComponent) component);
            case TRENDING_ARTICLE -> toTrendingArticleComponentDTO((TrendingArticleComponent) component);
            case LATEST_EVENT -> toLatestEventComponentDTO((LatestEventComponent) component);
            case TOP_EVENT -> toTopEventComponentDTO((TopEventComponent) component);
            case QUOTE_OF_THE_DAY -> toQuoteOfTheDayComponentDTO((QuoteOfTheDayComponent) component);
        };
    }

    /**
     * Maps a TopEventComponent entity to its DTO representation.
     *
     * @param component The TopEventComponent entity.
     * @return The mapped TopEventComponentDTO, or null if input is null.
     */
    private TopEventComponentDTO toTopEventComponentDTO(TopEventComponent component) {
        if (component == null) return null;
        return TopEventComponentDTO.builder()
                .id(component.getId())
                .uid(component.getUid())
                .name(component.getName())
                .type(component.getType().name())
                .title(component.getTitle())
                .eventSlug(component.getEventSlug())
                .build();
    }

    /**
     * Maps a TrendingArticleComponent entity to its DTO representation.
     *
     * @param component The TrendingArticleComponent entity.
     * @return The mapped TrendingArticleComponentDTO, or null if input is null.
     */
    private TrendingArticleComponentDTO toTrendingArticleComponentDTO(TrendingArticleComponent component) {
        if (component == null) return null;
        List<String> articleSlugs = component.getArticleSlugs() != null
                ? Arrays.asList(component.getArticleSlugs().split(","))
                : Collections.emptyList();
        return TrendingArticleComponentDTO.builder()
                .id(component.getId())
                .uid(component.getUid())
                .name(component.getName())
                .type(component.getType().name())
                .title(component.getTitle())
                .articleSlugs(articleSlugs)
                .build();
    }

    /**
     * Maps a ParagraphComponent entity to its DTO representation.
     *
     * @param component The ParagraphComponent entity.
     * @return The mapped ParagraphComponentDTO, or null if input is null.
     */
    private ParagraphComponentDTO toParagraphComponentDTO(ParagraphComponent component) {
        if (component == null) return null;
        return ParagraphComponentDTO.builder()
                .id(component.getId())
                .uid(component.getUid())
                .name(component.getName())
                .type(component.getType().name())
                .title(component.getTitle())
                .content(component.getContent())
                .build();
    }

    /**
     * Maps a BannerComponent entity to its DTO representation.
     *
     * @param component The BannerComponent entity.
     * @return The mapped BannerComponentDTO, or null if input is null.
     */
    private BannerComponentDTO toBannerComponentDTO(BannerComponent component) {
        if (component == null) return null;
        return BannerComponentDTO.builder()
                .id(component.getId())
                .uid(component.getUid())
                .name(component.getName())
                .type(component.getType().name())
                .imageUrl(component.getImageUrl())
                .altText(component.getAltText())
                .title(component.getTitle())
                .subtitle(component.getSubtitle())
                .ctaText(component.getCtaText())
                .ctaUrl(component.getCtaUrl())
                .build();
    }

    /**
     * Maps a ProductCarouselComponent entity to its DTO.
     *
     * @param component The ProductCarouselComponent entity.
     * @return The mapped DTO, or null if source is null.
     */
    private ProductCarouselComponentDTO toProductCarouselComponentDTO(ProductCarouselComponent component) {
        if (component == null) {
            return null;
        }
        List<String> productCodes = component.getProductCodes() != null
                ? Arrays.asList(component.getProductCodes().split(","))
                : Collections.emptyList();

        return ProductCarouselComponentDTO.builder()
                .id(component.getId())
                .uid(component.getUid())
                .name(component.getName())
                .type(component.getType().name())
                .title(component.getTitle())
                .subtitle(component.getSubtitle())
                .productCodes(productCodes)

                .build();
    }

    /**
     * Maps a NavigationComponent entity to its DTO representation.
     *
     * @param component The NavigationComponent entity.
     * @return The mapped NavigationComponentDTO, or null if input is null.
     */
    private NavigationComponentDTO toNavigationComponentDTO(NavigationComponent component) {
        if (component == null) return null;
        return NavigationComponentDTO.builder()
                .id(component.getId())
                .uid(component.getUid())
                .name(component.getName())
                .type(component.getType().name())
                .displayText(component.getDisplayText())
                .url(component.getUrl())
                .icon(component.getIcon())
                .build();
    }

    /**
     * Maps a QuickMenuComponent entity to its DTO representation.
     *
     * @param component The QuickMenuComponent entity.
     * @return The mapped QuickMenuComponentDTO, or null if input is null.
     */
    private QuickMenuComponentDTO toQuickMenuComponentDTO(QuickMenuComponent component) {
        if (component == null) return null;
        return QuickMenuComponentDTO.builder()
                .id(component.getId())
                .uid(component.getUid())
                .name(component.getName())
                .type(component.getType().name())
                .title(component.getTitle())
                .imageUrl(component.getImageUrl())
                .url(component.getUrl())
                .build();
    }

    /**
     * Maps a ProductDetailComponent entity to its DTO representation.
     *
     * @param component The ProductDetailComponent entity.
     * @return The mapped ProductDetailComponentDTO, or null if input is null.
     */
    private ProductDetailComponentDTO toProductDetailComponentDTO(ProductDetailComponent component) {
        if (component == null) return null;
        return ProductDetailComponentDTO.builder()
                .id(component.getId())
                .uid(component.getUid())
                .name(component.getName())
                .type(component.getType().name())
                .title(component.getTitle())
                .showPrice(component.getShowPrice())
                .showDescription(component.getShowDescription())
                .build();
    }

    /**
     * Maps a LatestArticleComponent entity to its DTO representation.
     *
     * @param component The LatestArticleComponent entity.
     * @return The mapped LatestArticleComponentDTO, or null if input is null.
     */
    private LatestArticleComponentDTO toLatestArticleComponentDTO(LatestArticleComponent component) {
        if (component == null) return null;
        return LatestArticleComponentDTO.builder()
                .id(component.getId())
                .uid(component.getUid())
                .name(component.getName())
                .type(component.getType().name())
                .title(component.getTitle())
                .articleCount(component.getArticleCount())
                .build();
    }

    /**
     * Maps a LatestEventComponent entity to its DTO representation.
     *
     * @param component The LatestEventComponent entity.
     * @return The mapped LatestEventComponentDTO, or null if input is null.
     */
    private LatestEventComponentDTO toLatestEventComponentDTO(LatestEventComponent component) {
        if (component == null) return null;
        List<String> eventSlugs = component.getEventSlugs() != null
                ? Arrays.asList(component.getEventSlugs().split(","))
                : Collections.emptyList();
        return LatestEventComponentDTO.builder()
                .id(component.getId())
                .uid(component.getUid())
                .name(component.getName())
                .type(component.getType().name())
                .title(component.getTitle())
                .eventSlugs(eventSlugs)
                .build();
    }

    /**
     * Maps a QuoteOfTheDayComponent entity to its DTO representation.
     *
     * @param component The QuoteOfTheDayComponent entity.
     * @return The mapped QuoteOfTheDayComponentDTO, or null if input is null.
     */
    private QuoteOfTheDayComponentDTO toQuoteOfTheDayComponentDTO(QuoteOfTheDayComponent component) {
        if (component == null) return null;
        return QuoteOfTheDayComponentDTO.builder()
                .id(component.getId())
                .uid(component.getUid())
                .name(component.getName())
                .type(component.getType().name())
                .title(component.getTitle())
                .quote(component.getQuote())
                .build();
    }
    public ProductDTO toProductDTO(Product product) {
        if (product == null) {
            return null;
        }

        return ProductDTO.builder()
                .id(product.getId())
                .code(product.getCode())
                .name(product.getName())
                .imageUrl(product.getImageUrl())
                .price(product.getPrice())
                .description(product.getDescription())
                .build();
    }

    /**
     * Maps a list of Product entities to a list of ProductDTOs.
     *
     * @param products The list of Product entities.
     * @return A list of mapped ProductDTOs, ignoring null entries.
     */
    public List<ProductDTO> toProductDTOList(List<Product> products) {
        if (products == null) {
            return Collections.emptyList();
        }

        return products.stream()
                .filter(java.util.Objects::nonNull)
                .map(this::toProductDTO)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }
}
