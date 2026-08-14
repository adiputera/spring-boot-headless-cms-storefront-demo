package id.adiputera.demo.cms.storefront.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Slot Details Request class.
 *
 * @author Yusuf F. Adiputera
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlotDetailsRequest {
    private List<Long> slotIds;
    private boolean isEdit;
}
