import { useSelector } from "react-redux";

export const useRole = () => {
  const role = useSelector((state) => state.user.user?.role);
  return { role, isAdmin: role === "admin", canEdit: role === "admin" };
};
