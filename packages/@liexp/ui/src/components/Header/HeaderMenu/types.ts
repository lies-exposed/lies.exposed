import type React from "react";

interface View {
  view: string;
  search?: Record<string, any>;
}

export interface HeaderMenuSubItem extends View {
  label: React.ReactNode;
}

export interface HeaderMenuItem extends HeaderMenuSubItem {
  label: React.ReactNode;
  subItems: HeaderMenuSubItem[];
}
