import {ImageContentCreatedResponse} from '../../action-rule/models/image-content-created-response.interface';

export interface CreateSpendActionRuleResponse {
  Id: string;
  CreatedImageContents: ImageContentCreatedResponse[];
}
