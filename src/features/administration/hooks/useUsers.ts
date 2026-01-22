import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user.api";
import { CreateUserDto, UpdateUserDto } from "../types/user.types";

export const useUsers = (filters: any = {}) => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["users", filters],
    queryFn: () => userApi.getUsers(filters),
  });

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: () => userApi.getRoles(),
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: CreateUserDto) => userApi.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      console.error("Error creating user:", error);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
      userApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      console.error("Error updating user:", error);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => userApi.toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      console.error("Error toggling user status:", error);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      console.error("Error deleting user:", error);
    },
  });

  return {
    usersQuery,
    rolesQuery,
    createUserMutation,
    updateUserMutation,
    toggleStatusMutation,
    deleteUserMutation,
  };
};
