import {ImageAddRequest} from './image-add-request.interface';

export interface ImageEditRequest extends ImageAddRequest {
  Id: string;
}
