package id.adiputera.demo.cms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

/**
 * Latest Event Component D T O class.
 *
 * @author Yusuf F. Adiputera
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class LatestEventComponentDTO extends ComponentDTO {
    private String title;
    private List<String> eventSlugs;
}
