export interface paths {
    "/api/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Healthcheck */
        get: operations["healthcheck"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Me */
        get: operations["getCurrentActor"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/me/api-keys": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Api Keys */
        get: operations["listApiKeys"];
        put?: never;
        /** Create Api Key Route */
        post: operations["createApiKey"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/me/api-keys/{api_key_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Revoke Api Key */
        delete: operations["revokeApiKey"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Workspaces */
        get: operations["listWorkspaces"];
        put?: never;
        /** Create Workspace */
        post: operations["createWorkspace"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Workspace */
        get: operations["getWorkspace"];
        put?: never;
        post?: never;
        /** Delete Workspace Route */
        delete: operations["deleteWorkspace"];
        options?: never;
        head?: never;
        /** Update Workspace */
        patch: operations["updateWorkspace"];
        trace?: never;
    };
    "/api/workspace-invites/{invite_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Workspace Invite */
        get: operations["getWorkspaceInvite"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Workspace Members */
        get: operations["listWorkspaceMembers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/invites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Workspace Invites Route */
        get: operations["listWorkspaceInvites"];
        put?: never;
        /** Create Workspace Invite */
        post: operations["createWorkspaceInvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/invites/{invite_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete Workspace Invite */
        delete: operations["deleteWorkspaceInvite"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/invites/{invite_id}/accept": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Accept Workspace Invite */
        post: operations["acceptWorkspaceInvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/members/{user_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete Workspace Member */
        delete: operations["deleteWorkspaceMember"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/projects": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Projects */
        get: operations["listProjects"];
        put?: never;
        /** Create Project */
        post: operations["createProject"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/projects/{project_key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Project */
        get: operations["getProject"];
        put?: never;
        post?: never;
        /** Delete Project */
        delete: operations["deleteProject"];
        options?: never;
        head?: never;
        /** Update Project */
        patch: operations["updateProject"];
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/task-types": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Task Types */
        get: operations["listTaskTypes"];
        put?: never;
        /** Create Task Type */
        post: operations["createTaskType"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/task-types/{type_key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Task Type */
        get: operations["getTaskType"];
        put?: never;
        post?: never;
        /** Delete Task Type */
        delete: operations["deleteTaskType"];
        options?: never;
        head?: never;
        /** Update Task Type */
        patch: operations["updateTaskType"];
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/task-priorities": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Task Priorities */
        get: operations["listTaskPriorities"];
        put?: never;
        /** Create Task Priority */
        post: operations["createTaskPriority"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/task-priorities/{priority_key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Task Priority */
        get: operations["getTaskPriority"];
        put?: never;
        post?: never;
        /** Delete Task Priority */
        delete: operations["deleteTaskPriority"];
        options?: never;
        head?: never;
        /** Update Task Priority */
        patch: operations["updateTaskPriority"];
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/tasks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Workspace Tasks */
        get: operations["listWorkspaceTasks"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/tasks/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Resolve Task */
        get: operations["resolveTask"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/projects/{project_key}/statuses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Project Statuses */
        get: operations["listProjectStatuses"];
        put?: never;
        /** Create Task Status */
        post: operations["createTaskStatus"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/projects/{project_key}/statuses/{status_key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Task Status */
        get: operations["getTaskStatus"];
        put?: never;
        post?: never;
        /** Delete Task Status */
        delete: operations["deleteTaskStatus"];
        options?: never;
        head?: never;
        /** Update Task Status */
        patch: operations["updateTaskStatus"];
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/projects/{project_key}/labels": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Labels */
        get: operations["listProjectLabels"];
        put?: never;
        /** Create Label */
        post: operations["createLabel"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/projects/{project_key}/labels/{label_key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Label */
        get: operations["getLabel"];
        put?: never;
        post?: never;
        /** Delete Label */
        delete: operations["deleteLabel"];
        options?: never;
        head?: never;
        /** Update Label */
        patch: operations["updateLabel"];
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Project Tasks */
        get: operations["listProjectTasks"];
        put?: never;
        /** Create Task */
        post: operations["createTask"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Task */
        get: operations["getTask"];
        put?: never;
        post?: never;
        /** Delete Task */
        delete: operations["deleteTask"];
        options?: never;
        head?: never;
        /** Update Task */
        patch: operations["updateTask"];
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/comments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Task Comments */
        get: operations["listTaskComments"];
        put?: never;
        /** Create Task Comment */
        post: operations["createTaskComment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/comments/{comment_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete Task Comment */
        delete: operations["deleteTaskComment"];
        options?: never;
        head?: never;
        /** Update Task Comment */
        patch: operations["updateTaskComment"];
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/links": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Task Links */
        get: operations["listTaskLinks"];
        put?: never;
        /** Create Task Link */
        post: operations["createTaskLink"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/links/{link_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete Task Link */
        delete: operations["deleteTaskLink"];
        options?: never;
        head?: never;
        /** Update Task Link */
        patch: operations["updateTaskLink"];
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/references": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Task References */
        get: operations["listTaskReferences"];
        put?: never;
        /** Create Task Reference */
        post: operations["createTaskReference"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/projects/{project_key}/tasks/{task_number}/references/{reference_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete Task Reference */
        delete: operations["deleteTaskReference"];
        options?: never;
        head?: never;
        /** Update Task Reference */
        patch: operations["updateTaskReference"];
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/projects/{project_key}/boards": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Boards */
        get: operations["listBoards"];
        put?: never;
        /** Create Board */
        post: operations["createBoard"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/workspaces/{workspace_slug}/projects/{project_key}/boards/{board_key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Board */
        get: operations["getBoard"];
        put?: never;
        post?: never;
        /** Delete Board */
        delete: operations["deleteBoard"];
        options?: never;
        head?: never;
        /** Update Board */
        patch: operations["updateBoard"];
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** APIKeyCreate */
        APIKeyCreate: {
            /** Name */
            name: string;
        };
        /** APIKeyRead */
        APIKeyRead: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Name */
            name: string;
            /** Key Prefix */
            key_prefix: string;
            /** Is Active */
            is_active: boolean;
            /** Last Used At */
            last_used_at: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
        };
        /** APIKeyWithSecret */
        APIKeyWithSecret: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Name */
            name: string;
            /** Key Prefix */
            key_prefix: string;
            /** Is Active */
            is_active: boolean;
            /** Last Used At */
            last_used_at: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /** Secret */
            secret: string;
        };
        /** AuthActorRead */
        AuthActorRead: {
            /** Auth Type */
            auth_type: string;
            user: components["schemas"]["UserRead"];
        };
        /** BoardCreate */
        BoardCreate: {
            /** Key */
            key: string;
            /** Name */
            name: string;
            /** Description */
            description?: string | null;
            /** Filters */
            filters?: {
                [key: string]: unknown;
            };
        };
        /** BoardRead */
        BoardRead: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Project Id
             * Format: uuid
             */
            project_id: string;
            /** Key */
            key: string;
            /** Name */
            name: string;
            /** Description */
            description: string | null;
            /** Filters */
            filters: {
                [key: string]: unknown;
            };
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** BoardUpdate */
        BoardUpdate: {
            /** Name */
            name?: string | null;
            /** Description */
            description?: string | null;
            /** Filters */
            filters?: {
                [key: string]: unknown;
            } | null;
        };
        /** HTTPValidationError */
        HTTPValidationError: {
            /** Detail */
            detail?: components["schemas"]["ValidationError"][];
        };
        /** LabelCreate */
        LabelCreate: {
            /** Key */
            key: string;
            /** Name */
            name: string;
            /** Color */
            color?: string | null;
        };
        /** LabelRead */
        LabelRead: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Project Id
             * Format: uuid
             */
            project_id: string;
            /** Key */
            key: string;
            /** Name */
            name: string;
            /** Color */
            color: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** LabelUpdate */
        LabelUpdate: {
            /** Name */
            name?: string | null;
            /** Color */
            color?: string | null;
        };
        /** ProjectCreate */
        ProjectCreate: {
            /** Key */
            key: string;
            /** Name */
            name: string;
            /** Description */
            description?: string | null;
        };
        /** ProjectRead */
        ProjectRead: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Workspace Id
             * Format: uuid
             */
            workspace_id: string;
            /** Key */
            key: string;
            /** Name */
            name: string;
            /** Description */
            description: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** ProjectUpdate */
        ProjectUpdate: {
            /** Name */
            name?: string | null;
            /** Description */
            description?: string | null;
        };
        /** TaskCommentCreate */
        TaskCommentCreate: {
            /** Body */
            body: string;
        };
        /** TaskCommentRead */
        TaskCommentRead: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Task Id
             * Format: uuid
             */
            task_id: string;
            /** Author User Id */
            author_user_id: string | null;
            /** Body */
            body: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** TaskCommentUpdate */
        TaskCommentUpdate: {
            /** Body */
            body: string;
        };
        /** TaskCreate */
        TaskCreate: {
            /** Title */
            title: string;
            /** Description */
            description?: string | null;
            /** Status Key */
            status_key?: string | null;
            /** Type Key */
            type_key?: string | null;
            /** Priority Key */
            priority_key?: string | null;
            /** Label Keys */
            label_keys?: string[] | null;
            /** Assignee User Id */
            assignee_user_id?: string | null;
            parent_task?: components["schemas"]["TaskRef"] | null;
        };
        /** TaskLabelRead */
        TaskLabelRead: {
            /** Key */
            key: string;
            /** Name */
            name: string;
            /** Color */
            color: string | null;
        };
        /** TaskLinkCreate */
        TaskLinkCreate: {
            target_task: components["schemas"]["TaskRef"];
            /**
             * Relationship Type
             * @default relates_to
             */
            relationship_type: string;
        };
        /** TaskLinkRead */
        TaskLinkRead: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Workspace Id
             * Format: uuid
             */
            workspace_id: string;
            /**
             * Source Task Id
             * Format: uuid
             */
            source_task_id: string;
            /**
             * Target Task Id
             * Format: uuid
             */
            target_task_id: string;
            /** Relationship Type */
            relationship_type: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** TaskLinkUpdate */
        TaskLinkUpdate: {
            /** Relationship Type */
            relationship_type: string;
        };
        /** TaskPriorityCreate */
        TaskPriorityCreate: {
            /** Key */
            key: string;
            /** Name */
            name: string;
            /**
             * Rank
             * @default 0
             */
            rank: number;
        };
        /** TaskPriorityRead */
        TaskPriorityRead: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Workspace Id
             * Format: uuid
             */
            workspace_id: string;
            /** Key */
            key: string;
            /** Name */
            name: string;
            /** Rank */
            rank: number;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** TaskPriorityUpdate */
        TaskPriorityUpdate: {
            /** Name */
            name?: string | null;
            /** Rank */
            rank?: number | null;
        };
        /** TaskRead */
        TaskRead: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Workspace Id
             * Format: uuid
             */
            workspace_id: string;
            /**
             * Project Id
             * Format: uuid
             */
            project_id: string;
            /** Project Key */
            project_key?: string | null;
            /** Display Ref */
            display_ref?: string | null;
            /** Number */
            number: number;
            /** Title */
            title: string;
            /** Description */
            description: string | null;
            /** Parent Task Id */
            parent_task_id: string | null;
            /** Assignee User Id */
            assignee_user_id: string | null;
            /** Reporter User Id */
            reporter_user_id: string | null;
            /** Status Id */
            status_id: string | null;
            /** Type Id */
            type_id: string | null;
            /** Priority Id */
            priority_id: string | null;
            /** Labels */
            labels?: components["schemas"]["TaskLabelRead"][];
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** TaskRef */
        TaskRef: {
            /** Project Key */
            project_key: string;
            /** Task Number */
            task_number: number;
        };
        /** TaskReferenceCreate */
        TaskReferenceCreate: {
            /** Title */
            title?: string | null;
            /**
             * Url
             * Format: uri
             */
            url: string;
        };
        /** TaskReferenceRead */
        TaskReferenceRead: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Task Id
             * Format: uuid
             */
            task_id: string;
            /** Title */
            title: string | null;
            /** Url */
            url: string;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** TaskReferenceUpdate */
        TaskReferenceUpdate: {
            /** Title */
            title?: string | null;
            /**
             * Url
             * Format: uri
             */
            url: string;
        };
        /** TaskResolveResult */
        TaskResolveResult: {
            /**
             * Status
             * @enum {string}
             */
            status: "resolved" | "ambiguous" | "not_found";
            task?: components["schemas"]["TaskRead"] | null;
            /** Candidates */
            candidates?: components["schemas"]["TaskRead"][];
        };
        /** TaskStatusCreate */
        TaskStatusCreate: {
            /** Key */
            key: string;
            /** Name */
            name: string;
            /** Category */
            category?: string | null;
            /**
             * Rank
             * @default 0
             */
            rank: number;
        };
        /** TaskStatusRead */
        TaskStatusRead: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Project Id
             * Format: uuid
             */
            project_id: string;
            /** Key */
            key: string;
            /** Name */
            name: string;
            /** Category */
            category: string | null;
            /** Rank */
            rank: number;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** TaskStatusUpdate */
        TaskStatusUpdate: {
            /** Name */
            name?: string | null;
            /** Category */
            category?: string | null;
            /** Rank */
            rank?: number | null;
        };
        /** TaskTypeCreate */
        TaskTypeCreate: {
            /** Key */
            key: string;
            /** Name */
            name: string;
            /** Description */
            description?: string | null;
        };
        /** TaskTypeRead */
        TaskTypeRead: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Workspace Id
             * Format: uuid
             */
            workspace_id: string;
            /** Key */
            key: string;
            /** Name */
            name: string;
            /** Description */
            description: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** TaskTypeUpdate */
        TaskTypeUpdate: {
            /** Name */
            name?: string | null;
            /** Description */
            description?: string | null;
        };
        /** TaskUpdate */
        TaskUpdate: {
            /** Title */
            title?: string | null;
            /** Description */
            description?: string | null;
            /** Status Key */
            status_key?: string | null;
            /** Type Key */
            type_key?: string | null;
            /** Priority Key */
            priority_key?: string | null;
            /** Label Keys */
            label_keys?: string[] | null;
            /** Assignee User Id */
            assignee_user_id?: string | null;
            parent_task?: components["schemas"]["TaskRef"] | null;
        };
        /** UserRead */
        UserRead: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Email */
            email: string | null;
            /** Display Name */
            display_name: string | null;
        };
        /** ValidationError */
        ValidationError: {
            /** Location */
            loc: (string | number)[];
            /** Message */
            msg: string;
            /** Error Type */
            type: string;
            /** Input */
            input?: unknown;
            /** Context */
            ctx?: Record<string, never>;
        };
        /** WorkspaceCreate */
        WorkspaceCreate: {
            /** Slug */
            slug: string;
            /** Name */
            name: string;
            /** Description */
            description?: string | null;
        };
        /** WorkspaceInviteCreate */
        WorkspaceInviteCreate: {
            /**
             * Email
             * Format: email
             */
            email: string;
            /**
             * Role
             * @default member
             * @enum {string}
             */
            role: "owner" | "member";
        };
        /** WorkspaceInviteRead */
        WorkspaceInviteRead: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /**
             * Workspace Id
             * Format: uuid
             */
            workspace_id: string;
            /** Workspace Slug */
            workspace_slug: string;
            /** Workspace Name */
            workspace_name: string;
            /** Email */
            email: string;
            /**
             * Role
             * @enum {string}
             */
            role: "owner" | "member";
            /** Invited By User Id */
            invited_by_user_id: string | null;
            /** Accepted At */
            accepted_at: string | null;
            /** Expires At */
            expires_at: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** WorkspaceMemberRead */
        WorkspaceMemberRead: {
            user: components["schemas"]["UserRead"];
            /**
             * Role
             * @enum {string}
             */
            role: "owner" | "member";
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** WorkspaceRead */
        WorkspaceRead: {
            /**
             * Id
             * Format: uuid
             */
            id: string;
            /** Slug */
            slug: string;
            /** Name */
            name: string;
            /** Description */
            description: string | null;
            /**
             * Created At
             * Format: date-time
             */
            created_at: string;
            /**
             * Updated At
             * Format: date-time
             */
            updated_at: string;
        };
        /** WorkspaceUpdate */
        WorkspaceUpdate: {
            /** Name */
            name?: string | null;
            /** Description */
            description?: string | null;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    healthcheck: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        [key: string]: string;
                    };
                };
            };
        };
    };
    getCurrentActor: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthActorRead"];
                };
            };
        };
    };
    listApiKeys: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["APIKeyRead"][];
                };
            };
        };
    };
    createApiKey: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["APIKeyCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["APIKeyWithSecret"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    revokeApiKey: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                api_key_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    listWorkspaces: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceRead"][];
                };
            };
        };
    };
    createWorkspace: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkspaceCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    getWorkspace: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deleteWorkspace: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    updateWorkspace: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkspaceUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    getWorkspaceInvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                invite_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceInviteRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    listWorkspaceMembers: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceMemberRead"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    listWorkspaceInvites: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceInviteRead"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    createWorkspaceInvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WorkspaceInviteCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceInviteRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deleteWorkspaceInvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                invite_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    acceptWorkspaceInvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                invite_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WorkspaceRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deleteWorkspaceMember: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                user_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    listProjects: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectRead"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    createProject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProjectCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    getProject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deleteProject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    updateProject: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProjectUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProjectRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    listTaskTypes: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskTypeRead"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    createTaskType: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaskTypeCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskTypeRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    getTaskType: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                type_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskTypeRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deleteTaskType: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                type_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    updateTaskType: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                type_key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaskTypeUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskTypeRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    listTaskPriorities: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskPriorityRead"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    createTaskPriority: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaskPriorityCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskPriorityRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    getTaskPriority: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                priority_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskPriorityRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deleteTaskPriority: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                priority_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    updateTaskPriority: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                priority_key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaskPriorityUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskPriorityRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    listWorkspaceTasks: {
        parameters: {
            query?: {
                projectKey?: string | null;
                statusKey?: string | null;
                assigneeUserId?: string | null;
                q?: string | null;
            };
            header?: never;
            path: {
                workspace_slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskRead"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    resolveTask: {
        parameters: {
            query: {
                target: string;
                projectKey?: string | null;
            };
            header?: never;
            path: {
                workspace_slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskResolveResult"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    listProjectStatuses: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskStatusRead"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    createTaskStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaskStatusCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskStatusRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    getTaskStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                status_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskStatusRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deleteTaskStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                status_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    updateTaskStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                status_key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaskStatusUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskStatusRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    listProjectLabels: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LabelRead"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    createLabel: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LabelCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LabelRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    getLabel: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                label_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LabelRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deleteLabel: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                label_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    updateLabel: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                label_key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LabelUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["LabelRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    listProjectTasks: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskRead"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    createTask: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaskCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    getTask: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                task_number: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deleteTask: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                task_number: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    updateTask: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                task_number: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaskUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    listTaskComments: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                task_number: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskCommentRead"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    createTaskComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                task_number: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaskCommentCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskCommentRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deleteTaskComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                task_number: number;
                comment_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    updateTaskComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                task_number: number;
                comment_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaskCommentUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskCommentRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    listTaskLinks: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                task_number: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskLinkRead"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    createTaskLink: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                task_number: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaskLinkCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskLinkRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deleteTaskLink: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                task_number: number;
                link_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    updateTaskLink: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                task_number: number;
                link_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaskLinkUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskLinkRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    listTaskReferences: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                task_number: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskReferenceRead"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    createTaskReference: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                task_number: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaskReferenceCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskReferenceRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deleteTaskReference: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                task_number: number;
                reference_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    updateTaskReference: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                task_number: number;
                reference_id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["TaskReferenceUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskReferenceRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    listBoards: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BoardRead"][];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    createBoard: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BoardCreate"];
            };
        };
        responses: {
            /** @description Successful Response */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BoardRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    getBoard: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                board_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BoardRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    deleteBoard: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                board_key: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful Response */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
    updateBoard: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                workspace_slug: string;
                project_key: string;
                board_key: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["BoardUpdate"];
            };
        };
        responses: {
            /** @description Successful Response */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BoardRead"];
                };
            };
            /** @description Validation Error */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HTTPValidationError"];
                };
            };
        };
    };
}
