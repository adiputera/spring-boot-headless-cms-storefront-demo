package id.adiputera.demo.cms.storefront.controller;

import id.adiputera.demo.cms.dto.SlotDTO;
import id.adiputera.demo.cms.storefront.dto.SlotDetailsRequest;
import id.adiputera.demo.cms.storefront.dto.SlotDetailsResponse;
import id.adiputera.demo.cms.storefront.service.SlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Slot Controller class.
 *
 * @author Yusuf F. Adiputera
 */
@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SlotController {

    private final SlotService slotService;

    @PostMapping("/details")
    public ResponseEntity<SlotDetailsResponse> getSlotDetails(
            @Valid @RequestBody SlotDetailsRequest request) {
        log.info("POST /api/slots/details with {} slot IDs, edit: {}",
                 request.getSlotIds() != null ? request.getSlotIds().size() : 0, request.isEdit());

        List<SlotDTO> slots = slotService.getSlotsByIds(request.getSlotIds(), request.isEdit());

        SlotDetailsResponse response = SlotDetailsResponse.builder()
                .slots(slots)
                .build();

        return ResponseEntity.ok(response);
    }
}
