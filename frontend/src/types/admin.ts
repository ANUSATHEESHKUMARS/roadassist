import React from "react";

export interface GetUsersResponseDto {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: "user" | "mechanic" | "admin";
}

export interface ColumnDef<T> {
  key: string;
  header: string;
  className?: string;
  cell: (item: T) => React.ReactNode;
}