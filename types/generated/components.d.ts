import type { Schema, Struct } from '@strapi/strapi';

export interface FaqItemItem extends Struct.ComponentSchema {
  collectionName: 'components_faq_item_items';
  info: {
    displayName: 'item';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.String & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ItineraryItemItem extends Struct.ComponentSchema {
  collectionName: 'components_itinerary_item_items';
  info: {
    displayName: 'item';
  };
  attributes: {
    description: Schema.Attribute.String & Schema.Attribute.Required;
    time: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'faq-item.item': FaqItemItem;
      'itinerary-item.item': ItineraryItemItem;
    }
  }
}
