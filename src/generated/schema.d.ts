/**
 * JET OpenAPI types.
 *
 * Regenerate with `bun run generate:api` once a JET API server is running.
 */
export interface paths {
  "/api/me": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": components["schemas"]["AuthActorRead"];
          };
        };
      };
    };
  };
  "/api/workspaces": {
    get: {
      responses: {
        200: {
          content: {
            "application/json": components["schemas"]["WorkspaceRead"][];
          };
        };
      };
    };
  };
  "/api/workspaces/{workspace_slug}/projects": {
    get: {
      parameters: {
        path: {
          workspace_slug: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": components["schemas"]["ProjectRead"][];
          };
        };
      };
    };
  };
  "/api/workspaces/{workspace_slug}/tasks": {
    get: {
      parameters: {
        path: {
          workspace_slug: string;
        };
        query?: {
          projectKey?: string;
          statusKey?: string;
          assigneeUserId?: string;
          q?: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": components["schemas"]["TaskRead"][];
          };
        };
      };
    };
  };
  "/api/workspaces/{workspace_slug}/tasks/resolve": {
    get: {
      parameters: {
        path: {
          workspace_slug: string;
        };
        query: {
          target: string;
          projectKey?: string;
        };
      };
      responses: {
        200: {
          content: {
            "application/json": components["schemas"]["TaskResolveResult"];
          };
        };
      };
    };
  };
  "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks": {
    post: {
      parameters: {
        path: {
          workspace_slug: string;
          project_key: string;
        };
      };
      requestBody: {
        content: {
          "application/json": components["schemas"]["TaskCreate"];
        };
      };
      responses: {
        201: {
          content: {
            "application/json": components["schemas"]["TaskRead"];
          };
        };
      };
    };
  };
  "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}": {
    get: taskByNumberOperation;
    patch: taskUpdateOperation;
    delete: taskDeleteOperation;
  };
  "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/comments": {
    get: {
      parameters: taskPathParameters;
      responses: {
        200: {
          content: {
            "application/json": components["schemas"]["TaskCommentRead"][];
          };
        };
      };
    };
    post: {
      parameters: taskPathParameters;
      requestBody: {
        content: {
          "application/json": components["schemas"]["TaskCommentCreate"];
        };
      };
      responses: {
        201: {
          content: {
            "application/json": components["schemas"]["TaskCommentRead"];
          };
        };
      };
    };
  };
}

type taskPathParameters = {
  path: {
    workspace_slug: string;
    project_key: string;
    task_number: number;
  };
};

type taskByNumberOperation = {
  parameters: taskPathParameters;
  responses: {
    200: {
      content: {
        "application/json": components["schemas"]["TaskRead"];
      };
    };
  };
};

type taskUpdateOperation = {
  parameters: taskPathParameters;
  requestBody: {
    content: {
      "application/json": components["schemas"]["TaskUpdate"];
    };
  };
  responses: {
    200: {
      content: {
        "application/json": components["schemas"]["TaskRead"];
      };
    };
  };
};

type taskDeleteOperation = {
  parameters: taskPathParameters;
  responses: {
    204: {
      content: never;
    };
  };
};

export interface components {
  schemas: {
    AuthActorRead: {
      auth_type: string;
      user: components["schemas"]["UserRead"];
    };
    UserRead: {
      id: string;
      email: string | null;
      display_name: string | null;
    };
    WorkspaceRead: {
      id: string;
      slug: string;
      name: string;
      description: string | null;
      created_at: string;
      updated_at: string;
    };
    ProjectRead: {
      id: string;
      workspace_id: string;
      key: string;
      name: string;
      description: string | null;
      created_at: string;
      updated_at: string;
    };
    TaskLabelRead: {
      key: string;
      name: string;
      color: string | null;
    };
    TaskRead: {
      id: string;
      workspace_id: string;
      project_id: string;
      project_key: string | null;
      display_ref: string | null;
      number: number;
      title: string;
      description: string | null;
      parent_task_id: string | null;
      assignee_user_id: string | null;
      reporter_user_id: string | null;
      status_id: string | null;
      type_id: string | null;
      priority_id: string | null;
      labels: components["schemas"]["TaskLabelRead"][];
      created_at: string;
      updated_at: string;
    };
    TaskCreate: {
      title: string;
      description?: string | null;
      status_key?: string | null;
      type_key?: string | null;
      priority_key?: string | null;
      label_keys?: string[] | null;
      assignee_user_id?: string | null;
      parent_task?: components["schemas"]["TaskRef"] | null;
    };
    TaskUpdate: {
      title?: string | null;
      description?: string | null;
      status_key?: string | null;
      type_key?: string | null;
      priority_key?: string | null;
      label_keys?: string[] | null;
      assignee_user_id?: string | null;
      parent_task?: components["schemas"]["TaskRef"] | null;
    };
    TaskRef: {
      project_key: string;
      task_number: number;
    };
    TaskResolveResult: {
      status: "resolved" | "ambiguous" | "not_found";
      task: components["schemas"]["TaskRead"] | null;
      candidates: components["schemas"]["TaskRead"][];
    };
    TaskCommentCreate: {
      body: string;
    };
    TaskCommentRead: {
      id: string;
      task_id: string;
      author_user_id: string | null;
      body: string;
      created_at: string;
      updated_at: string;
    };
  };
}
