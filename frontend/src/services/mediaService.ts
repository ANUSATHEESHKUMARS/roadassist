import type { MediaSection, MediaResponse, SingleMediaResponse } from "@/types/media"
import apiClient from "./apiClient"
import API_ROUTES from "./apiRoutes"

export const uploadMedia = async (
  file: File,
  section: MediaSection
): Promise<SingleMediaResponse> => {
  const formData = new FormData()

  formData.append('file', file)

  formData.append('section', section)

  const response = await apiClient.post<SingleMediaResponse>(
    API_ROUTES.ADMIN.UPLOAD_MEDIA,
    formData
  )

  return response.data
}

export const getMedia = async (): Promise<MediaResponse> => {

  const response = await apiClient.get<MediaResponse>(API_ROUTES.ADMIN.MEDIA);

  return response.data
}


export const deleteMedia = async (id: string): Promise<{ success: boolean; message: string }> => {

  const response = await apiClient.delete<{ success: boolean; message: string }>(
    API_ROUTES.ADMIN.MEDIA_BY_ID(id)
  )

  return response.data
}


export const getPublicMedia = async (): Promise<MediaResponse> => {

    const response = await apiClient.get<MediaResponse>(API_ROUTES.MEDIA.PUBLIC);

    return response.data;
};