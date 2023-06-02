/* istanbul ignore file */
import { addImage, getImage, updateImage } from "../database/mongodb/adapter";
import type { ImageFields, ImageStatus } from "./models";

export async function createImage(): Promise<string> {
  return addImage({ status: "CREATING" });
}

export async function getStatus(imageId: string): Promise<ImageStatus> {
  return (await getImage(imageId)).status;
}

export async function changeImage(imageId: string, imageFields: ImageFields): Promise<void> {
  return updateImage(imageId, imageFields);
}
