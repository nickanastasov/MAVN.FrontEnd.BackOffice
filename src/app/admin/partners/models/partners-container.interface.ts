export class PartnersContainer {
  PartnerIds: string[];

  static HandlePartnersBeforeSaving(model: PartnersContainer): void {
    if (model.PartnerIds && model.PartnerIds.length > 1) {
      // distinct to be unique
      model.PartnerIds = Array.from(new Set(model.PartnerIds));
    }
  }
}
