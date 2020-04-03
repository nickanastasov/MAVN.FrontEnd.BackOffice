import {ImageResponse} from './image-response.interface';

export class ActionRuleMobileContent {
  MobileLanguage: string;
  Title: string;
  TitleId: string;
  Description: string;
  DescriptionId: string;
  File: File;
  Image: ImageResponse;
  ImageId: string;
  ImageBlobUrl: string;
}
