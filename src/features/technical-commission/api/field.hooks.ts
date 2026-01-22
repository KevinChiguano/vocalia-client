import { useQuery } from "@tanstack/react-query";
import { fieldApi } from "./field.api";

export const useFields = () => {
  return useQuery({
    queryKey: ["fields"],
    queryFn: () => fieldApi.getFields(),
  });
};
