package id.adiputera.demo.cms.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

/**
 * Component D T O class.
 *
 * @author Yusuf F. Adiputera
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type", visible = true)
@JsonSubTypes({
    @JsonSubTypes.Type(value = ParagraphComponentDTO.class, name = "PARAGRAPH"),
    @JsonSubTypes.Type(value = BannerComponentDTO.class, name = "BANNER"),
    @JsonSubTypes.Type(value = ProductCarouselComponentDTO.class, name = "PRODUCT_CAROUSEL"),
    @JsonSubTypes.Type(value = NavigationComponentDTO.class, name = "NAVIGATION"),
    @JsonSubTypes.Type(value = QuickMenuComponentDTO.class, name = "QUICK_MENU"),
    @JsonSubTypes.Type(value = ProductDetailComponentDTO.class, name = "PRODUCT_DETAIL"),
    @JsonSubTypes.Type(value = LatestArticleComponentDTO.class, name = "LATEST_ARTICLE"),
    @JsonSubTypes.Type(value = TrendingArticleComponentDTO.class, name = "TRENDING_ARTICLE"),
    @JsonSubTypes.Type(value = LatestEventComponentDTO.class, name = "LATEST_EVENT"),
    @JsonSubTypes.Type(value = TopEventComponentDTO.class, name = "TOP_EVENT"),
    @JsonSubTypes.Type(value = QuoteOfTheDayComponentDTO.class, name = "QUOTE_OF_THE_DAY")
})
public abstract class ComponentDTO {

    private Long id;

    @NotBlank(message = "UID is required")
    private String uid;

    @NotBlank(message = "Component name is required")
    private String name;

    @NotNull(message = "Component type is required")
    private String type;

    @NotNull(message = "Sort order is required")
    private Integer sortOrder;

    private String syncStatus;
}
