package id.adiputera.demo.cms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

/**
 * Product Carousel Component D T O class.
 *
 * @author Yusuf F. Adiputera
 */
@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ProductCarouselComponentDTO extends ComponentDTO {
    private String title;
    private String subtitle;

    private List<String> productCodes;
}
