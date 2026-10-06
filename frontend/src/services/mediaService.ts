import type { MediaSection, MediaResponse } from "@/types/media"
import apiClient from "./apiClient"

export const uploadMedia = async (file: File,
  section: MediaSection
) => {
  const formData = new FormData()

  formData.append('file', file)

  formData.append('section', section)

  const response = await apiClient.post('/admin/media/upload', formData)

  return response.data
}

export const getMedia = async (): Promise<MediaResponse> => {

  const response = await apiClient.get<MediaResponse>('/admin/media');

  return response.data
}


export const deleteMedia = async (id : string) => {

  const response = await apiClient.delete(`/admin/media/${id}`)

  return response.data
}