import {ImageContentCreatedResponse} from '../../action-rule/models/image-content-created-response.interface';

export interface CreateEarnActionRuleResponse {
  Id: string;
  CreatedImageContents: ImageContentCreatedResponse[];
}
