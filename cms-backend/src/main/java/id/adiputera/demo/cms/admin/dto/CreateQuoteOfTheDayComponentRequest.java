package id.adiputera.demo.cms.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CreateQuoteOfTheDayComponentRequest extends CreateComponentRequest {
    private String title;
    private String quote;
}
