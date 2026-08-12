package id.adiputera.demo.cms.entity.component;

import id.adiputera.demo.cms.annotation.CmsComponent;
import id.adiputera.demo.cms.annotation.CmsField;
import id.adiputera.demo.cms.annotation.CmsFieldType;
import id.adiputera.demo.cms.annotation.ReferenceCardinality;
import id.adiputera.demo.cms.entity.Component;
import id.adiputera.demo.cms.entity.ComponentType;
import id.adiputera.demo.cms.entity.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Product Carousel Component class.
 *
 * @author Yusuf F. Adiputera
 */
@Entity
@Table(name = "product_carousel_components")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@CmsComponent(displayName = "Product Carousel", description = "Grid of selected products by codes")
public class ProductCarouselComponent extends Component {

    @Size(max = 255)
    @Column(name = "title")
    @CmsField(displayName = "Carousel Title", type = CmsFieldType.STRING, required = true, placeholder = "Featured Products")
    private String title;

    @Size(max = 255)
    @Column(name = "subtitle")
    @CmsField(displayName = "Carousel Subtitle", type = CmsFieldType.STRING, required = false, placeholder = "Featured Products Subtitle")
    private String subtitle;


    @Column(name = "product_codes", columnDefinition = "TEXT")
    @CmsField(displayName = "Products", type = CmsFieldType.REFERENCE, targetEntity = Product.class, cardinality = ReferenceCardinality.MULTIPLE, required = true, placeholder = "Select products...")
    private String productCodes; // Comma-separated list of product IDs

    /**
     * Gets the component type.
     *
     * @return The component type.
     * @see Component#getType()
     */
    @Override
    public ComponentType getType() {
        return ComponentType.PRODUCT_CAROUSEL;
    }
}

