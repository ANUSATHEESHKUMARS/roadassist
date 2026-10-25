import type { MediaSection, MediaResponse } from "@/types/media"
import apiClient from "./apiClient"
import API_ROUTES from "./apiRoutes"

export const uploadMedia = async (file: File,
  section: MediaSection
) => {
  const formData = new FormData()

  formData.append('file', file)

  formData.append('section', section)

  const response = await apiClient.post(API_ROUTES.ADMIN.UPLOAD_MEDIA, formData)

  return response.data
}

export const getMedia = async (): Promise<MediaResponse> => {

  const response = await apiClient.get<MediaResponse>(API_ROUTES.ADMIN.MEDIA);

  return response.data
}


export const deleteMedia = async (id : string) => {

  const response = await apiClient.delete(API_ROUTES.ADMIN.MEDIA_BY_ID(id))

  return response.data
}


export const getPublicMedia = async () => {

    const response = await apiClient.get(API_ROUTES.MEDIA.PUBLIC);

    console.log("PUBLIC MEDIA API RESPONSE:", response.data);
    
    return response.data;
};