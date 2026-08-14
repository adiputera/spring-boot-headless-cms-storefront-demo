package id.adiputera.demo.cms.storefront.service;

import id.adiputera.demo.cms.dto.SlotDTO;
import id.adiputera.demo.cms.entity.Slot;
import id.adiputera.demo.cms.mapper.EntityMapper;
import id.adiputera.demo.cms.storefront.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Slot Service class.
 *
 * @author Yusuf F. Adiputera
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SlotService {

    private final SlotRepository slotRepository;
    private final EntityMapper entityMapper;

    /**
     * Retrieves a list of slot DTOs with their components by their IDs.
     *
     * @param slotIds The list of slot IDs to retrieve.
     * @param isEdit True if fetching for live edit (disables caching).
     * @return A list of mapped SlotDTO objects.
     */
    @Cacheable(value = "slots", key = "#slotIds.toString()", condition = "!#isEdit")
    @Transactional(readOnly = true)
    public List<SlotDTO> getSlotsByIds(List<Long> slotIds, boolean isEdit) {
        log.debug("Fetching slots with IDs: {}, edit: {}", slotIds, isEdit);

        if (slotIds == null || slotIds.isEmpty()) {
            return List.of();
        }

        List<Slot> slots = slotRepository.findByIdInWithComponents(slotIds);

        return slots.stream()
                .filter(java.util.Objects::nonNull)
                .map(entityMapper::toSlotDTOWithComponents)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }
}
