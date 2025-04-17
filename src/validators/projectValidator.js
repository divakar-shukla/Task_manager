import {body} from "express-validator"

const createProjectValidator = () => {
    return [
      body("name").notEmpty().withMessage("Name is required"),
      body("description").optional(),
    ];
  };

  const addMemberToProjectValidator = () => {
    return [
      body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid"),
      body("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn(AvailableUserRoles)
        .withMessage("Role is invalid"),
    ];
  };
  
  const createTaskValidator = () => {
    return [
      body("title").notEmpty().withMessage("Title is required"),
      body("description").optional(),
      body("assignedTo").notEmpty().withMessage("Assigned to is required"),
      body("status")
        .optional()
        .notEmpty()
        .withMessage("Status is required")
        .isIn(AvailableTaskStatuses),
    ];
  };
  
  const updateTaskValidator = () => {
    return [
      body("title").optional(),
      body("description").optional(),
      body("status")
        .optional()
        .isIn(AvailableTaskStatuses)
        .withMessage("Status is invalid"),
      body("assignedTo").optional(),
    ];
  };
  
  const notesValidator = () => {
    return [body("content").notEmpty().withMessage("Content is required")];
  };


  export {
    createProjectValidator,
    addMemberToProjectValidator,
    createTaskValidator,
    updateTaskValidator,
    notesValidator
  }