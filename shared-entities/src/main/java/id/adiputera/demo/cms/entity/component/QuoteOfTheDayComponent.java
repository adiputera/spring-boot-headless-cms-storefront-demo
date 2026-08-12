package id.adiputera.demo.cms.entity.component;

import id.adiputera.demo.cms.annotation.CmsComponent;
import id.adiputera.demo.cms.annotation.CmsField;
import id.adiputera.demo.cms.annotation.CmsFieldType;
import id.adiputera.demo.cms.entity.Component;
import id.adiputera.demo.cms.entity.ComponentType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "quote_of_the_day_components")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@CmsComponent(displayName = "Quote of the Day", description = "Displays a daily quote")
public class QuoteOfTheDayComponent extends Component {

    @Size(max = 255)
    @Column(name = "title")
    @CmsField(displayName = "Title", type = CmsFieldType.STRING, required = true, placeholder = "Quote of the Day")
    private String title;

    @Size(max = 1000)
    @Column(name = "quote", length = 1000)
    @CmsField(displayName = "Quote", type = CmsFieldType.STRING, required = true, placeholder = "Enter quote here...")
    private String quote;

    @Override
    public ComponentType getType() {
        return ComponentType.QUOTE_OF_THE_DAY;
    }
}
