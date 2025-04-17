import { todo } from "node:test";

 const UserRoleEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member",
};

 const AvailableUserRoles = Object.values(UserRoleEnum);

 const TaskStatusEnum = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
};

 const AvailableTaskStatus = Object.values(TaskStatusEnum);

export {UserRoleEnum, AvailableUserRoles, TaskStatusEnum, AvailableTaskStatus}